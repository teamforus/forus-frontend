import { useMemo, useState } from 'react';
import { chunk } from 'lodash';
import { useRequesterImportService } from '../../../../services/RequesterImportService';
import { RequesterImportSyncOutcome, RequesterImportSyncPreview } from '../../../../props/models/RequesterImportRow';
import useBatchedPreviewAction from '../../../../hooks/batch-processing/useBatchedPreviewAction';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import { BatchScope } from '../../../../hooks/batch-processing/types';
import { RequesterImportSyncResult } from '../types';

export default function useRequesterImportSync(organizationId: number) {
    const requesterImportService = useRequesterImportService();

    const [updateAll, setUpdateAll] = useState(false);
    const [skipUnchanged, setSkipUnchanged] = useState(false);
    const [executionSkipUnchanged, setExecutionSkipUnchanged] = useState(false);
    const [skippedRows, setSkippedRows] = useState<RequesterImportSyncPreview[]>([]);

    const action = useBatchedPreviewAction<boolean, BatchScope, RequesterImportSyncPreview, RequesterImportSyncOutcome>(
        {
            loadIds: () => requesterImportService.syncIds(organizationId).then((response) => response.data.data),
            makeBatches: (ids) => chunk(ids, BATCH_SIZE).map((ids) => ({ ids })),
            previewBatch: (batch, updateAll) =>
                requesterImportService
                    .previewSync(organizationId, updateAll, batch.ids)
                    .then((response) => response.data.data),
            executeBatch: (batch, updateAll) =>
                requesterImportService
                    .sync(organizationId, updateAll, batch.ids)
                    .then((response) => response.data.data),
            previewId: (row) => row.id,
            resultId: (row) => row.id,
            isRejected: (error) => error.status === 422 && !!error.data?.errors,
        },
    );

    const results = useMemo((): RequesterImportSyncResult[] => {
        if (action.results === null) {
            return null;
        }

        const skipped: RequesterImportSyncResult[] = skippedRows.map((row) => ({
            id: row.id,
            bsn: row.bsn,
            profile_id: row.profile_id,
            status: 'skipped',
        }));

        return [...action.results, ...skipped].sort((left, right) => left.id - right.id);
    }, [action.results, skippedRows]);

    const reset = () => {
        action.reset();
        setSkipUnchanged(false);
        setExecutionSkipUnchanged(false);
        setSkippedRows([]);
    };

    return {
        ...action,
        results,
        updateAll,
        skipUnchanged,
        executionSkipUnchanged,
        setSkipUnchanged,
        unchangedCount: action.preview?.filter((row) => row.action === 'unchanged').length || 0,
        changeMode: (value: boolean) => {
            reset();
            setUpdateAll(value);
        },
        back: reset,
        calculate: () => {
            reset();
            action.calculate(updateAll);
        },
        synchronize: () => {
            if (action.phase !== 'preview') {
                return;
            }

            const skipped = skipUnchanged ? action.preview.filter((row) => row.action === 'unchanged') : [];

            setSkippedRows(skipped);
            setExecutionSkipUnchanged(skipUnchanged);
            action.execute({ skippedIds: skipped.map((row) => row.id) });
        },
    };
}
