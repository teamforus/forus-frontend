import { useCallback, useEffect, useRef, useState } from 'react';
import { BatchProgressOptions, BatchProgressQueue, BatchProgressTiming } from '../types';

type BatchProgressRun = {
    startedAt: number;
    finishedAt: number | null;
    queue: BatchProgressQueue | null;
    completedItems: number;
    completedBatches: number;
    samples: Array<{ items: number; durationMs: number }>;
};

export default function useBatchProgress({
    stopping = false,
    minTotalBatches = 5,
    minCompletedBatches = 3,
    sampleSize = 5,
}: BatchProgressOptions = {}) {
    const [elapsedMs, setElapsedMs] = useState(0);
    const [running, setRunning] = useState(false);
    const [remainingMs, setRemainingMs] = useState<number | null>(null);

    const runRef = useRef<BatchProgressRun>(null);

    const timing: BatchProgressTiming = { elapsedMs, remainingMs: running && !stopping ? remainingMs : null };

    const start = useCallback((queue: BatchProgressQueue | null = null) => {
        runRef.current = {
            startedAt: performance.now(),
            finishedAt: null,
            queue,
            completedItems: 0,
            completedBatches: 0,
            samples: [],
        };

        setElapsedMs(0);
        setRemainingMs(null);
        setRunning(true);
    }, []);

    const setQueue = useCallback((queue: BatchProgressQueue) => {
        if (runRef.current && runRef.current.finishedAt === null) {
            runRef.current.queue = queue;
        }
    }, []);

    const startBatch = useCallback(
        (items: number) => {
            const run = runRef.current;
            const startedAt = performance.now();

            return () => {
                if (!run || runRef.current !== run || run.finishedAt !== null) {
                    return;
                }

                const now = performance.now();

                run.completedItems += items;
                run.completedBatches += 1;
                run.samples = [...run.samples, { items, durationMs: now - startedAt }].slice(-sampleSize);
                setElapsedMs(now - run.startedAt);

                if (
                    !run.queue ||
                    run.queue.totalBatches < minTotalBatches ||
                    run.completedBatches < minCompletedBatches
                ) {
                    return;
                }

                const sampleItems = run.samples.reduce((total, sample) => total + sample.items, 0);
                const sampleDuration = run.samples.reduce((total, sample) => total + sample.durationMs, 0);
                const remainingItems = Math.max(0, run.queue.totalItems - run.completedItems);

                setRemainingMs(Math.ceil(((sampleDuration / sampleItems) * remainingItems) / 1000) * 1000);
            };
        },
        [minCompletedBatches, minTotalBatches, sampleSize],
    );

    const finish = useCallback(() => {
        const run = runRef.current;

        if (!run || run.finishedAt !== null) {
            return;
        }

        run.finishedAt = performance.now();
        setElapsedMs(run.finishedAt - run.startedAt);
        setRemainingMs(null);
        setRunning(false);
    }, []);

    useEffect(() => {
        if (!running) {
            return;
        }

        const interval = window.setInterval(() => {
            const run = runRef.current;

            if (run && run.finishedAt === null) {
                setElapsedMs(performance.now() - run.startedAt);
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [running]);

    useEffect(() => {
        return () => {
            runRef.current = null;
        };
    }, []);

    return { timing, start, setQueue, startBatch, finish };
}
