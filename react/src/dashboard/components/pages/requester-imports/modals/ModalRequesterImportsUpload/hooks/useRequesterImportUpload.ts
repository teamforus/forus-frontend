import { useCallback, useEffect, useRef, useState } from 'react';
import useTranslate from '../../../../../../hooks/useTranslate';
import { useRequesterImportService } from '../../../../../../services/RequesterImportService';
import { ResponseError } from '../../../../../../props/ApiResponses';
import { RequesterImportCsv, RequesterImportCsvError, RequesterImportUploadResult } from '../types';

export default function useRequesterImportUpload(
    csv: RequesterImportCsv | null,
    organizationId: number,
    onChanged: () => void,
) {
    const translate = useTranslate();

    const requesterImportService = useRequesterImportService();

    const [progress, setProgress] = useState(0);
    const [stopping, setStopping] = useState(false);
    const [validated, setValidated] = useState(false);
    const [errors, setErrors] = useState<RequesterImportCsvError[]>([]);
    const [results, setResults] = useState<RequesterImportUploadResult[]>([]);
    const [busy, setBusy] = useState<'validating' | 'uploading' | null>(null);

    const stopRef = useRef(false);
    const runningRef = useRef(false);
    const mountedRef = useRef(false);

    const stop = useCallback(() => {
        if (!runningRef.current) {
            return false;
        }

        stopRef.current = true;
        setStopping(true);

        return true;
    }, []);

    const run = useCallback(async () => {
        if (runningRef.current || !csv?.rows.length || csv.errors.length) {
            return;
        }

        const indices = results.length
            ? results.filter((result) => ['failed', 'unsubmitted'].includes(result.status)).map(({ index }) => index)
            : csv.rows.map((_, index) => index);

        if (!indices.length) {
            return;
        }

        runningRef.current = true;
        stopRef.current = false;
        setStopping(false);
        setBusy('validating');
        setProgress(0);
        setErrors([]);
        setValidated(false);

        const validationErrors: RequesterImportCsvError[] = [];
        let refreshRequired = false;

        try {
            for (let offset = 0; offset < indices.length && !stopRef.current; offset += 1000) {
                const batch = indices.slice(offset, offset + 1000);

                try {
                    await requesterImportService.validateBatch(
                        organizationId,
                        batch.map((index) => csv.rows[index]),
                    );
                } catch (error) {
                    const response = error as ResponseError;

                    if (response.status !== 422 || !response.data?.errors) {
                        throw error;
                    }

                    for (const [key, messages] of Object.entries(response.data.errors)) {
                        const match = /^rows\.(\d+)(?:\.(.+))?$/.exec(key);

                        validationErrors.push(
                            ...messages.map((message) => ({
                                row: match ? csv.rowNumbers[batch[Number(match[1])]] : undefined,
                                column: match?.[2],
                                message,
                            })),
                        );
                    }
                }

                if (mountedRef.current) {
                    setProgress((Math.min(offset + 1000, indices.length) / indices.length) * 100);
                }
            }

            if (stopRef.current) {
                return;
            }

            setErrors(validationErrors);
            setValidated(!validationErrors.length);

            if (validationErrors.length) {
                return;
            }

            const nextResults: RequesterImportUploadResult[] = results.length
                ? results.map((result) =>
                      ['failed', 'unsubmitted'].includes(result.status)
                          ? { index: result.index, status: 'unsubmitted' }
                          : result,
                  )
                : indices.map((index) => ({ index, status: 'unsubmitted' }));

            setResults([...nextResults]);
            setBusy('uploading');
            setProgress(0);
            setValidated(false);

            for (let offset = 0; offset < indices.length && !stopRef.current; offset += 50) {
                const batch = indices.slice(offset, offset + 50);

                try {
                    const response = await requesterImportService.importBatch(
                        organizationId,
                        batch.map((index) => csv.rows[index]),
                    );

                    const outcomes = response.data?.data;

                    if (
                        !Array.isArray(outcomes) ||
                        outcomes.length !== batch.length ||
                        new Set(outcomes.map(({ index }) => index)).size !== batch.length ||
                        outcomes.some(
                            ({ index, status }) =>
                                !Number.isInteger(index) ||
                                index < 0 ||
                                index >= batch.length ||
                                !['created', 'updated', 'unchanged', 'failed'].includes(status),
                        )
                    ) {
                        throw new Error('Invalid import response');
                    }

                    for (const outcome of outcomes) {
                        const index = batch[outcome.index];

                        nextResults[index] = {
                            index,
                            status: outcome.status,
                            diagnosticId: outcome.status === 'failed' ? outcome.diagnostic_id : undefined,
                            message:
                                outcome.status === 'failed'
                                    ? Object.entries(outcome.errors || {})
                                          .flatMap(([key, messages]) => messages.map((message) => `${key}: ${message}`))
                                          .join(' ') ||
                                      (outcome.code === 'duplicate_identifier'
                                          ? translate('requester_imports.errors.identifier_conflict')
                                          : translate('requester_imports.errors.row_failed'))
                                    : undefined,
                        };

                        refreshRequired ||= outcome.status === 'created' || outcome.status === 'updated';
                    }
                } catch (error) {
                    const response = error as ResponseError;
                    const rejected = response.status === 422 && !!response.data?.errors;

                    refreshRequired ||= !rejected;

                    for (const [batchIndex, index] of batch.entries()) {
                        nextResults[index] = {
                            index,
                            status: rejected ? 'failed' : 'unknown',
                            message: rejected
                                ? Object.entries(response.data.errors)
                                      .filter(
                                          ([key]) =>
                                              !key.startsWith('rows.') ||
                                              key === `rows.${batchIndex}` ||
                                              key.startsWith(`rows.${batchIndex}.`),
                                      )
                                      .flatMap(([, messages]) => messages)
                                      .join(' ') || translate('requester_imports.errors.batch_rejected')
                                : translate('requester_imports.errors.unknown'),
                        };
                    }

                    stopRef.current = true;
                }

                if (mountedRef.current) {
                    setResults([...nextResults]);
                    setProgress((Math.min(offset + 50, indices.length) / indices.length) * 100);
                }
            }
        } catch {
            if (mountedRef.current) {
                setErrors([{ message: translate('requester_imports.errors.validation_failed') }]);
            }
        } finally {
            runningRef.current = false;

            if (mountedRef.current) {
                setBusy(null);
                setStopping(false);

                if (refreshRequired) {
                    onChanged();
                }
            }
        }
    }, [csv, onChanged, organizationId, requesterImportService, results, translate]);

    useEffect(() => {
        setProgress(0);
        setErrors([]);
        setResults([]);
        setValidated(false);
    }, [csv]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            stopRef.current = true;
        };
    }, []);

    return { busy, progress, stopping, validated, errors, results, run, stop };
}
