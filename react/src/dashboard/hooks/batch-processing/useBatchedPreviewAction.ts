import { useCallback, useEffect, useRef, useState } from 'react';
import { ResponseError } from '../../props/ApiResponses';
import { BatchedPreviewActionOptions, BatchPhase, BatchReport, BatchScope } from './types';
import useBatchProgress from '../../modules/batch-progress/hooks/useBatchProgress';

export default function useBatchedPreviewAction<TOptions, TBatch extends BatchScope, TPreview, TResult>(
    options: BatchedPreviewActionOptions<TOptions, TBatch, TPreview, TResult>,
) {
    const [error, setError] = useState<ResponseError>(null);
    const [stopping, setStopping] = useState(false);
    const [results, setResults] = useState<TResult[]>(null);
    const [preview, setPreview] = useState<TPreview[]>(null);
    const [phase, setPhase] = useState<BatchPhase>('options');
    const [selection, setSelection] = useState<TOptions>(null);
    const [report, setReport] = useState<BatchReport<TBatch>>(null);
    const [previewReport, setPreviewReport] = useState<BatchReport<TBatch>>(null);

    const busyRef = useRef(false);
    const stopRef = useRef(false);
    const generationRef = useRef(0);
    const mountedRef = useRef(false);
    const runRef = useRef<{ ids: number[]; batches: TBatch[]; options: TOptions }>(null);

    const {
        timing,
        start: startTiming,
        setQueue: setTimingQueue,
        startBatch: startTimingBatch,
        finish: finishTiming,
    } = useBatchProgress({ stopping });

    const reset = useCallback(() => {
        if (busyRef.current) {
            return;
        }

        generationRef.current += 1;
        finishTiming();
        stopRef.current = false;
        runRef.current = null;
        setStopping(false);
        setPhase('options');
        setSelection(null);
        setPreview(null);
        setResults(null);
        setReport(null);
        setPreviewReport(null);
        setError(null);
    }, [finishTiming]);

    const cancelPreview = useCallback(() => {
        if (phase !== 'estimating') {
            return;
        }

        busyRef.current = false;
        reset();
    }, [phase, reset]);

    const stop = useCallback(() => {
        if (phase === 'running') {
            stopRef.current = true;
            setStopping(true);
        }
    }, [phase]);

    const processBatches = useCallback(
        <T>(
            stage: 'preview' | 'execution',
            run: { ids: number[]; batches: TBatch[]; options: TOptions },
            request: (batch: TBatch, selection: TOptions) => Promise<T[]>,
            resultId: (result: T) => number,
            save: (results: T[]) => void,
            generation: number,
            skippedIds?: number[],
        ): Promise<void> => {
            const active = () => mountedRef.current && generationRef.current === generation;
            const outcomes: T[] = [];

            const current: BatchReport<TBatch> = {
                stage,
                status: 'running',
                candidate_ids: run.ids,
                ...(skippedIds ? { skipped_ids: skippedIds } : {}),
                total: run.batches.reduce((total, batch) => total + batch.ids.length, 0),
                processed: 0,
                missing: [],
                uncertain: null,
                rejected: null,
                unsubmitted: [],
                new_ids: [],
                candidate_check: 'not_run',
                finished_at: null,
            };

            setReport({ ...current });
            setTimingQueue({ totalItems: current.total, totalBatches: run.batches.length });

            const next = (index: number): Promise<void> => {
                if (!active()) {
                    return Promise.resolve();
                }

                if (index === run.batches.length) {
                    finishTiming();
                    current.status = 'completed';
                    current.finished_at = new Date().toISOString();
                    save(outcomes);

                    if (stage === 'preview') {
                        setPreviewReport({ ...current });
                        setReport({ ...current });
                        setPhase('preview');
                        return Promise.resolve();
                    }

                    current.candidate_check = 'pending';
                    setReport({ ...current });
                    setPhase('results');

                    return Promise.resolve()
                        .then(() => (active() ? options.loadIds() : []))
                        .then((ids) => {
                            if (active()) {
                                const initialIds = new Set(run.ids);

                                current.new_ids = ids.filter((id) => !initialIds.has(id));
                                current.candidate_check = 'completed';
                                setReport({ ...current });
                            }
                        })
                        .catch(() => {
                            if (active()) {
                                current.candidate_check = 'failed';
                                setReport({ ...current });
                            }
                        });
                }

                if (stage === 'execution' && stopRef.current) {
                    finishTiming();
                    current.status = 'stopped';
                    current.finished_at = new Date().toISOString();
                    current.unsubmitted = run.batches.slice(index);
                    save(outcomes);
                    setReport({ ...current });
                    setPhase('interrupted');
                    return Promise.resolve();
                }

                const batch = run.batches[index];
                const completeTimingBatch = startTimingBatch(batch.ids.length);

                return Promise.resolve()
                    .then(() => (active() ? request(batch, run.options) : []))
                    .then((rows) => {
                        if (!active()) {
                            return false;
                        }

                        if (!Array.isArray(rows)) {
                            throw new Error('Invalid batch response');
                        }

                        const returned = new Set(rows.map(resultId));
                        const missing = batch.ids.filter((id) => !returned.has(id));

                        outcomes.push(...rows);

                        if (missing.length) {
                            current.missing = [...current.missing, { ...batch, ids: missing }];
                        }

                        current.processed += batch.ids.length;
                        completeTimingBatch();
                        setReport({ ...current });
                        return true;
                    })
                    .catch((error: ResponseError) => {
                        if (active()) {
                            finishTiming();
                            current.status = 'interrupted';
                            current.finished_at = new Date().toISOString();
                            current.unsubmitted = run.batches.slice(index + 1);

                            if (options.isRejected(error)) {
                                current.rejected = batch;
                            } else {
                                current.uncertain = batch;
                            }

                            save(outcomes);
                            setReport({ ...current });
                            setError(error);
                            setPhase('interrupted');
                        }

                        return false;
                    })
                    .then((proceed) => {
                        if (proceed) {
                            return next(index + 1);
                        }
                    });
            };

            return next(0);
        },
        [finishTiming, options, setTimingQueue, startTimingBatch],
    );

    const calculate = useCallback(
        (selection: TOptions) => {
            if (busyRef.current) {
                return;
            }

            reset();
            busyRef.current = true;

            const generation = generationRef.current;
            const active = () => mountedRef.current && generationRef.current === generation;

            setSelection(selection);
            setPhase('estimating');
            startTiming();

            options
                .loadIds()
                .then((ids) => {
                    if (!active()) {
                        return;
                    }

                    const run = { ids, options: selection, batches: options.makeBatches(ids, selection) };

                    runRef.current = run;
                    return processBatches(
                        'preview',
                        run,
                        options.previewBatch,
                        options.previewId,
                        setPreview,
                        generation,
                    );
                })
                .catch((error: ResponseError) => {
                    if (active()) {
                        finishTiming();
                        setError(error);
                        setPhase('interrupted');
                    }
                })
                .finally(() => {
                    if (active()) {
                        busyRef.current = false;
                    }
                });
        },
        [finishTiming, options, processBatches, reset, startTiming],
    );

    const execute = useCallback(
        ({
            skippedIds,
            filterBatch,
        }: {
            skippedIds?: number[];
            filterBatch?: (batch: TBatch) => TBatch;
        } = {}) => {
            if (busyRef.current || phase !== 'preview' || !runRef.current) {
                return;
            }

            busyRef.current = true;
            stopRef.current = false;
            setStopping(false);
            setError(null);
            setPhase('running');
            startTiming();

            const generation = generationRef.current;
            const skipped = new Set(skippedIds);
            const run = runRef.current;

            const executionRun = {
                ...run,
                batches: skipped.size
                    ? options.makeBatches(
                          run.ids.filter((id) => !skipped.has(id)),
                          run.options,
                      )
                    : run.batches,
            };

            if (filterBatch) {
                executionRun.batches = executionRun.batches.map(filterBatch).filter((batch) => batch.ids.length > 0);
            }

            processBatches(
                'execution',
                executionRun,
                options.executeBatch,
                options.resultId,
                setResults,
                generation,
                skippedIds,
            ).finally(() => {
                if (mountedRef.current && generationRef.current === generation) {
                    busyRef.current = false;
                    setStopping(false);
                }
            });
        },
        [options, phase, processBatches, startTiming],
    );

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            generationRef.current += 1;
            busyRef.current = false;
        };
    }, []);

    return {
        phase,
        timing,
        selection,
        preview,
        results,
        report,
        previewReport,
        error,
        stopping,
        stop,
        calculate,
        execute,
        reset,
        cancelPreview,
    };
}
