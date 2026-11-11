import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { RequestConfig, ResponseSimple } from '../props/ApiResponses';
import VoucherPass, {
    VoucherPassConfiguration,
    VoucherPassInput,
    VoucherPassOutcome,
    VoucherPassPreview,
} from '../props/models/VoucherPass';

export class VoucherPassService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public list(
        organizationId: number,
        filters: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<VoucherPass>> {
        return this.apiRequest.get(`/platform/organizations/${organizationId}/sponsor/voucher-passes`, filters, config);
    }

    public configs(
        organizationId: number,
        config: RequestConfig = {},
    ): Promise<ResponseSimple<{ data: VoucherPassConfiguration }>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/voucher-passes/configs`,
            {},
            config,
        );
    }

    public validateBatch(
        organizationId: number,
        rows: VoucherPassInput[],
    ): Promise<ResponseSimple<{ data: VoucherPassPreview[] }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/voucher-passes/batch/validate`, {
            rows,
        });
    }

    public importBatch(
        organizationId: number,
        rows: VoucherPassInput[],
    ): Promise<ResponseSimple<{ data: VoucherPassOutcome[] }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/voucher-passes/batch`, { rows });
    }

    public update(
        organizationId: number,
        id: number,
        values: VoucherPassInput,
    ): Promise<ResponseSimple<{ data: VoucherPass }>> {
        return this.apiRequest.patch(`/platform/organizations/${organizationId}/sponsor/voucher-passes/${id}`, values);
    }
}

export function useVoucherPassService(): VoucherPassService {
    return useState(() => new VoucherPassService())[0];
}
