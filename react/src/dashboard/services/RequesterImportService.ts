import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { RequestConfig, ResponseSimple } from '../props/ApiResponses';
import { RequesterImportConfiguration } from '../props/models/RequesterImportConfiguration';
import RequesterImportRow, {
    RequesterImportInput,
    RequesterImportOutcome,
    RequesterImportPreviewOutcome,
    RequesterImportSyncOutcome,
    RequesterImportSyncPreview,
} from '../props/models/RequesterImportRow';

export class RequesterImportService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public list(
        organizationId: number,
        filters: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<RequesterImportRow>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/requester-imports`,
            filters,
            config,
        );
    }

    public configs(
        organizationId: number,
        config: RequestConfig = {},
    ): Promise<ResponseSimple<{ data: RequesterImportConfiguration }>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/requester-imports/configs`,
            {},
            config,
        );
    }

    public validateBatch(
        organizationId: number,
        rows: RequesterImportInput[],
        config: RequestConfig = {},
    ): Promise<ResponseSimple<{ data: RequesterImportPreviewOutcome[] }>> {
        return this.apiRequest.post(
            `/platform/organizations/${organizationId}/sponsor/requester-imports/batch/validate`,
            { rows },
            config,
        );
    }

    public importBatch(
        organizationId: number,
        rows: RequesterImportInput[],
    ): Promise<ResponseSimple<{ data: RequesterImportOutcome[] }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/requester-imports/batch`, {
            rows,
        });
    }

    public update(
        organizationId: number,
        rowId: number,
        records: Record<string, string | null>,
    ): Promise<ResponseSimple<{ data: RequesterImportRow }>> {
        return this.apiRequest.patch(`/platform/organizations/${organizationId}/sponsor/requester-imports/${rowId}`, {
            records,
        });
    }

    public syncIds(organizationId: number): Promise<ResponseSimple<{ data: number[] }>> {
        return this.apiRequest.get(`/platform/organizations/${organizationId}/sponsor/requester-imports/sync/ids`);
    }

    public previewSync(
        organizationId: number,
        updateAll = false,
        rowIds?: number[],
    ): Promise<ResponseSimple<{ data: RequesterImportSyncPreview[] }>> {
        return this.apiRequest.post(
            `/platform/organizations/${organizationId}/sponsor/requester-imports/sync/preview`,
            {
                update_all: updateAll,
                row_ids: rowIds,
            },
        );
    }

    public sync(
        organizationId: number,
        updateAll = false,
        rowIds?: number[],
    ): Promise<ResponseSimple<{ data: RequesterImportSyncOutcome[] }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/requester-imports/sync`, {
            update_all: updateAll,
            row_ids: rowIds,
        });
    }
}

export function useRequesterImportService(): RequesterImportService {
    return useState(() => new RequesterImportService())[0];
}
