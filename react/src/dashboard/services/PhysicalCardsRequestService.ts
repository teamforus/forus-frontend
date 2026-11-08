import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import PhysicalCardRequest from '../props/models/PhysicalCardRequest';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class PhysicalCardsRequestService<T = PhysicalCardRequest> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    /**
     * Fetch list
     */
    public list(
        organizationId: number,
        voucherAddress: string,
        data: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests`,
            data,
            config,
        );
    }

    /**
     * Store
     */
    public store(organizationId: number, voucherAddress: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests`,
            data,
        );
    }

    /**
     * Validate
     */
    public validate(organizationId: number, voucherAddress: string, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(
            `${this.prefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests/validate`,
            data,
        );
    }

    public getColumns(showDCP = true): Array<ConfigurableTableColumn> {
        const list = [
            'id',
            'name',
            'address',
            'physical_card_type',
            'created_at',
            ...(showDCP ? ['dcp_order_id'] : []),
            'card_code',
            ...(showDCP ? ['dcp_state', 'shipped_at'] : []),
        ];

        return list.map((key) => ({
            key,
            label: `voucher_physical_card_requests.labels.${key}`,
            tooltip: {
                key: key,
                title: `voucher_physical_card_requests.labels.${key}`,
                description: `voucher_physical_card_requests.tooltips.${key}`,
            },
        }));
    }
}
export function usePhysicalCardsRequestService(): PhysicalCardsRequestService {
    return useState(new PhysicalCardsRequestService())[0];
}
