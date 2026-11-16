import { useCallback, useEffect, useRef, useState } from 'react';
import usePushApiError from '../../../../hooks/usePushApiError';
import { useRequesterImportService } from '../../../../services/RequesterImportService';
import { ResponseError } from '../../../../props/ApiResponses';
import { RequesterImportPreviewOutcome } from '../../../../props/models/RequesterImportRow';
import { RequesterImportCsv, RequesterImportCsvError } from '../types';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import useBatchProgress from '../../../../modules/batch-progress/hooks/useBatchProgress';

export default function useRequesterImportValidation(organizationId: number) {
    const pushApiError = usePushApiError();

    const requesterImportService = useRequesterImportService();

    const [checked, setChecked] = useState(0);
    const [validating, setValidating] = useState(false);
    const [errors, setErrors] = useState<RequesterImportCsvError[]>([]);
    const [preview, setPreview] = useState<RequesterImportPreviewOutcome[]>(null);

    const runRef = useRef(0);
    const runningRef = useRef(false);

    const { timing, start: startTiming, startBatch: startTimingBatch, finish: finishTiming } = useBatchProgress();

    const reset = useCallback(() => {
        runRef.current += 1;
        runningRef.current = false;
        finishTiming();
        setChecked(0);
        setErrors([]);
        setPreview(null);
        setValidating(false);
    }, [finishTiming]);

    const validate = useCallback(
        (csv: RequesterImportCsv | null) => {
            if (runningRef.current || !csv?.rows.length || csv.errors.length) {
                return;
            }

            reset();
            runningRef.current = true;
            setValidating(true);
            startTiming({ totalItems: csv.rows.length, totalBatches: Math.ceil(csv.rows.length / BATCH_SIZE) });

            const run = runRef.current;
            const results: RequesterImportPreviewOutcome[] = [];
            const validationErrors: RequesterImportCsvError[] = [];

            const validateBatch = (offset: number): Promise<void> => {
                if (run !== runRef.current) {
                    return Promise.resolve();
                }

                if (offset >= csv.rows.length) {
                    setErrors(validationErrors);
                    setPreview(validationErrors.length ? null : results);
                    return Promise.resolve();
                }

                const batch = csv.rows.slice(offset, offset + BATCH_SIZE);
                const completeTimingBatch = startTimingBatch(batch.length);

                return requesterImportService
                    .validateBatch(organizationId, batch)
                    .then(
                        (response) => {
                            if (run === runRef.current) {
                                results.push(
                                    ...response.data.data.map((row) => ({ ...row, index: row.index + offset })),
                                );
                            }
                        },
                        (error: ResponseError) => {
                            if (run !== runRef.current) {
                                return;
                            }

                            if (error.status !== 422 || !error.data?.errors) {
                                throw error;
                            }

                            for (const [key, messages] of Object.entries(error.data.errors)) {
                                const match = /^rows\.(\d+)(?:\.(.+))?$/.exec(key);

                                validationErrors.push(
                                    ...messages.map((message) => ({
                                        row: match ? csv.rowNumbers[offset + Number(match[1])] : undefined,
                                        column: csv.columnNames[match?.[2]] || match?.[2],
                                        message,
                                    })),
                                );
                            }
                        },
                    )
                    .then(() => {
                        if (run === runRef.current) {
                            completeTimingBatch();
                            setChecked(offset + batch.length);
                            return validateBatch(offset + batch.length);
                        }
                    });
            };

            validateBatch(0)
                .catch((error: ResponseError) => {
                    if (run === runRef.current) {
                        pushApiError(error);
                    }
                })
                .finally(() => {
                    if (run === runRef.current) {
                        runningRef.current = false;
                        finishTiming();
                        setValidating(false);
                    }
                });
        },
        [finishTiming, organizationId, pushApiError, requesterImportService, reset, startTiming, startTimingBatch],
    );

    useEffect(() => {
        return () => {
            runRef.current += 1;
            runningRef.current = false;
        };
    }, []);

    return { checked, validating, errors, preview, timing, validate, reset };
}
