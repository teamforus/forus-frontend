import { chunk } from 'lodash';
import { useVoucherPassService } from '../../../../services/VoucherPassService';
import useBatchedPreviewAction from '../../../../hooks/batch-processing/useBatchedPreviewAction';
import { BATCH_SIZE } from '../../../../hooks/batch-processing/constants';
import { BatchScope } from '../../../../hooks/batch-processing/types';
import VoucherPassDCPResult from '../../../../props/models/VoucherPassDCPResult';

export default function useVoucherPassDCP(organizationId: number) {
    const service = useVoucherPassService();

    return useBatchedPreviewAction<null, BatchScope, VoucherPassDCPResult, VoucherPassDCPResult>({
        loadIds: () => service.dcpIds(organizationId).then((response) => response.data.data),
        makeBatches: (ids) => chunk(ids, BATCH_SIZE).map((ids) => ({ ids })),
        previewBatch: (batch) => service.previewDCP(organizationId, batch.ids).then((response) => response.data.data),
        executeBatch: (batch) => service.syncDCP(organizationId, batch.ids).then((response) => response.data.data),
        previewId: (row) => row.id,
        resultId: (row) => row.id,
        isRejected: (error) => error.status === 422 && !!error.data?.errors,
    });
}
