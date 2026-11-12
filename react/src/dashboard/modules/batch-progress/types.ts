export type BatchProgressQueue = {
    totalItems: number;
    totalBatches: number;
};

export type BatchProgressOptions = {
    stopping?: boolean;
    minTotalBatches?: number;
    minCompletedBatches?: number;
    sampleSize?: number;
};

export type BatchProgressTiming = {
    elapsedMs: number;
    remainingMs: number | null;
};
