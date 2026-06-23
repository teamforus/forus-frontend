import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import FundProductLimit from '../props/models/FundProductLimit';

export class FundProductLimitService<T = FundProductLimit> {
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

    public list(organization_id: number, filters: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-product-limits`, filters, config);
    }

    public show(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/fund-product-limits/${id}`);
    }

    public update(organization_id: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organization_id}/fund-product-limits/${id}`, data);
    }

    public store(organization_id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/fund-product-limits`, data);
    }

    public destroy(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/fund-product-limits/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'fund', 'type', 'limit', 'created_at', 'state'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `fund_product_limits.labels.${key}`,
            tooltip: {
                key: key,
                title: `fund_product_limits.labels.${key}`,
                description: `fund_product_limits.tooltips.${key}`,
            },
        }));
    }
}

export function useFundProductLimitService(): FundProductLimitService {
    return useState(new FundProductLimitService())[0];
}
