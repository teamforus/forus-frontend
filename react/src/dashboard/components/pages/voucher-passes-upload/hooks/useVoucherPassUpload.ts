import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoucherPassService } from '../../../../services/VoucherPassService';
import { ResponseError } from '../../../../props/ApiResponses';
import { VoucherPassPreview } from '../../../../props/models/VoucherPass';
import { VoucherPassCsv, VoucherPassUploadOutcome } from '../types';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import useBatchProgress from '../../../../modules/batch-progress/hooks/useBatchProgress';

export default function useVoucherPassUpload(organizationId: number) {
    const passService = useVoucherPassService();

    const [total, setTotal] = useState(0);
    const [processed, setProcessed] = useState(0);
    const [stopping, setStopping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [skipUnchanged, setSkipUnchanged] = useState(false);
    const [completedAt, setCompletedAt] = useState<string>(null);
    const [results, setResults] = useState<VoucherPassUploadOutcome[]>(null);

    const stopRef = useRef(false);
    const startedRef = useRef(false);
    const mountedRef = useRef(false);

    const { timing, start: startTiming, startBatch, finish } = useBatchProgress({ stopping });

    const stop = useCallback(() => {
        stopRef.current = true;
        setStopping(true);
    }, []);

    const start = useCallback(
        (csv: VoucherPassCsv, preview: VoucherPassPreview[], skipUnchanged = false) => {
            if (startedRef.current || !csv.rows.length || csv.errors.length) {
                return;
            }

            startedRef.current = true;
            stopRef.current = false;
            setUploading(true);
            setStopping(false);
            setProcessed(0);
            setSkipUnchanged(skipUnchanged);

            const skipped = new Set(
                skipUnchanged ? preview.filter((row) => row.action === 'unchanged').map((row) => row.index) : [],
            );

            const queued = csv.rows.map((_, index) => index).filter((index) => !skipped.has(index));

            const outcomes: VoucherPassUploadOutcome[] = csv.rows.map((_, index) => ({
                index,
                status: skipped.has(index) ? 'skipped' : 'unsubmitted',
            }));

            setResults([...outcomes]);
            setTotal(queued.length);
            startTiming({ totalItems: queued.length, totalBatches: Math.ceil(queued.length / BATCH_SIZE) });

            const uploadBatch = (offset: number): Promise<void> => {
                if (stopRef.current || !mountedRef.current || offset >= queued.length) {
                    return Promise.resolve();
                }

                const batchIndexes = queued.slice(offset, offset + BATCH_SIZE);
                const batch = batchIndexes.map((index) => csv.rows[index]);
                const completeBatch = startBatch(batch.length);

                return passService
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
                            throw new Error('Invalid voucher pass import response');
                        }

                        for (const outcome of batchOutcomes) {
                            const index = batchIndexes[outcome.index];

                            outcomes[index] = { ...outcome, index };
                        }

                        completeBatch();
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
                    finish();
                    setCompletedAt(new Date().toISOString());
                    setUploading(false);
                    setStopping(false);
                }
            });
        },
        [finish, organizationId, passService, startBatch, startTiming],
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
