import { ResponseError } from '../../props/ApiResponses';

export type BatchScope = { ids: number[] };

export type BatchPhase = 'options' | 'estimating' | 'preview' | 'running' | 'results' | 'interrupted';

export type BatchReport<TBatch extends BatchScope> = {
    stage: 'preview' | 'execution';
    status: 'running' | 'completed' | 'interrupted' | 'stopped';
    candidate_ids: number[];
    skipped_ids?: number[];
    total: number;
    processed: number;
    missing: TBatch[];
    uncertain: TBatch | null;
    rejected: TBatch | null;
    unsubmitted: TBatch[];
    new_ids: number[];
    candidate_check: 'not_run' | 'pending' | 'completed' | 'failed';
    finished_at: string | null;
};

export type BatchedPreviewActionOptions<TOptions, TBatch extends BatchScope, TPreview, TResult> = {
    loadIds: () => Promise<number[]>;
    makeBatches: (ids: number[], options: TOptions) => TBatch[];
    previewBatch: (batch: TBatch, options: TOptions) => Promise<TPreview[]>;
    executeBatch: (batch: TBatch, options: TOptions) => Promise<TResult[]>;
    previewId: (result: TPreview) => number;
    resultId: (result: TResult) => number;
    isRejected: (error: ResponseError) => boolean;
};
