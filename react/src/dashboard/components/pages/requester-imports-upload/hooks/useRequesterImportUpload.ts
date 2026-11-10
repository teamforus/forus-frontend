import { useCallback, useEffect, useRef, useState } from 'react';
import { useRequesterImportService } from '../../../../services/RequesterImportService';
import { ResponseError } from '../../../../props/ApiResponses';
import { RequesterImportCsv, RequesterImportUploadOutcome } from '../types';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import { RequesterImportPreviewOutcome } from '../../../../props/models/RequesterImportRow';
import useBatchProgress from '../../../../modules/batch-progress/hooks/useBatchProgress';

export default function useRequesterImportUpload(organizationId: number) {
    const requesterImportService = useRequesterImportService();

    const [total, setTotal] = useState(0);
    const [processed, setProcessed] = useState(0);
    const [stopping, setStopping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [skipUnchanged, setSkipUnchanged] = useState(false);
    const [completedAt, setCompletedAt] = useState<string>(null);
    const [results, setResults] = useState<RequesterImportUploadOutcome[]>(null);

    const stopRef = useRef(false);
    const startedRef = useRef(false);
    const mountedRef = useRef(false);

    const {
        timing,
        start: startTiming,
        startBatch: startTimingBatch,
        finish: finishTiming,
    } = useBatchProgress({ stopping });

    const stop = useCallback(() => {
        stopRef.current = true;
        setStopping(true);
    }, []);

    const start = useCallback(
        (csv: RequesterImportCsv, preview: RequesterImportPreviewOutcome[], skipUnchanged = false) => {
            if (startedRef.current || !csv.rows.length || csv.errors.length) {
                return;
            }

            startedRef.current = true;
            stopRef.current = false;
            setUploading(true);
            setStopping(false);
            setProcessed(0);
            setSkipUnchanged(skipUnchanged);

            const skippedIndexes = new Set(
                skipUnchanged ? preview.filter((row) => row.action === 'unchanged').map((row) => row.index) : [],
            );

            const queuedIndexes = csv.rows.map((_, index) => index).filter((index) => !skippedIndexes.has(index));

            const outcomes: RequesterImportUploadOutcome[] = csv.rows.map((_, index) => ({
                index,
                status: skippedIndexes.has(index) ? 'skipped' : 'unsubmitted',
            }));

            setResults([...outcomes]);
            setTotal(queuedIndexes.length);
            startTiming({
                totalItems: queuedIndexes.length,
                totalBatches: Math.ceil(queuedIndexes.length / BATCH_SIZE),
            });

            const uploadBatch = (offset: number): Promise<void> => {
                if (stopRef.current || !mountedRef.current || offset >= queuedIndexes.length) {
                    return Promise.resolve();
                }

                const batchIndexes = queuedIndexes.slice(offset, offset + BATCH_SIZE);
                const batch = batchIndexes.map((index) => csv.rows[index]);
                const completeTimingBatch = startTimingBatch(batch.length);

                return requesterImportService
                    .importBatch(organizationId, batch)
                    .then((response) => {
                        const batchOutcomes = response.data?.data;

                        if (
                            !Array.isArray(batchOutcomes) ||
                            batchOutcomes.length !== batch.length ||
                            new Set(batchOutcomes.map(({ index }) => index)).size !== batch.length ||
                            batchOutcomes.some(
                                ({ index, status }) =>
                                    !Number.isInteger(index) ||
                                    index < 0 ||
                                    index >= batch.length ||
                                    !['created', 'updated', 'unchanged', 'failed'].includes(status),
                            )
                        ) {
                            throw new Error('Invalid import response');
                        }

                        for (const outcome of batchOutcomes) {
                            const index = batchIndexes[outcome.index];

                            outcomes[index] = { ...outcome, index };
                        }

                        completeTimingBatch();
                    })
                    .catch((error: ResponseError) => {
                        const rejected = error.status === 422 && !!error.data?.errors;

                        for (let index = 0; index < batch.length; index++) {
                            const prefix = `rows.${index}`;
                            const originalIndex = batchIndexes[index];

                            outcomes[originalIndex] = rejected
                                ? {
                                      index: originalIndex,
                                      status: 'failed',
                                      code: 'batch_rejected',
                                      errors: Object.fromEntries(
                                          Object.entries(error.data.errors)
                                              .filter(
                                                  ([key]) =>
                                                      !key.startsWith('rows.') ||
                                                      key === prefix ||
                                                      key.startsWith(`${prefix}.`),
                                              )
                                              .map(([key, messages]) => [
                                                  key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key,
                                                  messages,
                                              ]),
                                      ),
                                  }
                                : { index: originalIndex, status: 'unknown' };
                        }

                        stopRef.current = true;
                    })
                    .then(() => {
                        if (mountedRef.current) {
                            setResults([...outcomes]);
                            setProcessed(offset + batch.length);
                        }

                        return uploadBatch(offset + batch.length);
                    });
            };

            uploadBatch(0).finally(() => {
                if (mountedRef.current) {
                    finishTiming();
                    setCompletedAt(new Date().toISOString());
                    setUploading(false);
                    setStopping(false);
                }
            });
        },
        [finishTiming, organizationId, requesterImportService, startTiming, startTimingBatch],
    );

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            stopRef.current = true;
        };
    }, []);

    return { total, processed, uploading, stopping, results, completedAt, skipUnchanged, timing, start, stop };
}
