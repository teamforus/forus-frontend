import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { RequestConfig, ResponseSimple } from '../props/ApiResponses';
import RequesterImportRow, {
    RequesterImportInput,
    RequesterImportOutcome,
    RequesterImportSyncOutcome,
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

    public validateBatch(
        organizationId: number,
        rows: RequesterImportInput[],
        config: RequestConfig = {},
    ): Promise<ResponseSimple<unknown>> {
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

    public sync(
        organizationId: number,
        updateAll = false,
    ): Promise<ResponseSimple<{ data: RequesterImportSyncOutcome[] }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/requester-imports/sync`, {
            update_all: updateAll,
        });
    }
}

export function useRequesterImportService(): RequesterImportService {
    return useState(() => new RequesterImportService())[0];
}
