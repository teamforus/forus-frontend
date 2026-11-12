import { useCallback, useEffect, useRef, useState } from 'react';
import usePushApiError from '../../../../hooks/usePushApiError';
import { useVoucherPassService } from '../../../../services/VoucherPassService';
import { ResponseError } from '../../../../props/ApiResponses';
import { VoucherPassPreview } from '../../../../props/models/VoucherPass';
import { VoucherPassCsv, VoucherPassCsvError } from '../types';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import useBatchProgress from '../../../../modules/batch-progress/hooks/useBatchProgress';

export default function useVoucherPassValidation(organizationId: number) {
    const pushApiError = usePushApiError();

    const passService = useVoucherPassService();

    const [checked, setChecked] = useState(0);
    const [validating, setValidating] = useState(false);
    const [errors, setErrors] = useState<VoucherPassCsvError[]>([]);
    const [preview, setPreview] = useState<VoucherPassPreview[]>(null);

    const runRef = useRef(0);
    const runningRef = useRef(false);

    const { timing, start: startTiming, startBatch, finish } = useBatchProgress();

    const reset = useCallback(() => {
        runRef.current += 1;
        runningRef.current = false;
        finish();
        setChecked(0);
        setErrors([]);
        setPreview(null);
        setValidating(false);
    }, [finish]);

    const validate = useCallback(
        (csv: VoucherPassCsv) => {
            if (runningRef.current || !csv?.rows.length || csv.errors.length) {
                return;
            }

            reset();
            runningRef.current = true;
            setValidating(true);
            startTiming({ totalItems: csv.rows.length, totalBatches: Math.ceil(csv.rows.length / BATCH_SIZE) });

            const run = runRef.current;
            const results: VoucherPassPreview[] = [];
            const validationErrors: VoucherPassCsvError[] = [];

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
                const completeBatch = startBatch(batch.length);

                return passService
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
                                const field = match?.[2]?.split('.')[0];

                                validationErrors.push(
                                    ...messages.map((message) => ({
                                        row: match ? csv.rowNumbers[offset + Number(match[1])] : undefined,
                                        column: csv.columnNames[field] || field,
                                        message,
                                    })),
                                );
                            }
                        },
                    )
                    .then(() => {
                        if (run === runRef.current) {
                            completeBatch();
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
                        finish();
                        setValidating(false);
                    }
                });
        },
        [finish, organizationId, passService, pushApiError, reset, startBatch, startTiming],
    );

    useEffect(() => {
        return () => {
            runRef.current += 1;
            runningRef.current = false;
        };
    }, []);

    return { checked, validating, errors, preview, timing, validate, reset };
}
