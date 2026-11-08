import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import DCPOrderBulk from '../props/models/DCPOrderBulk';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class DCPOrderBulkService<T = DCPOrderBulk> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     */
    public prefix = '/platform/organizations';

    public list(organizationId: number, data: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/dcp-order-bulks`, data, config);
    }

    public store(organizationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/dcp-order-bulks`);
    }

    public show(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/dcp-order-bulks/${id}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'created_at', 'employee', 'orders_count', 'orders_sent', 'orders_error', 'state'];

        return list.map((key) => ({
            key,
            label: `dcp_order_bulks.labels.${key}`,
            tooltip: {
                key: key,
                title: `dcp_order_bulks.labels.${key}`,
                description: `dcp_order_bulks.tooltips.${key}`,
            },
        }));
    }
}

export function useDCPOrderBulkService(): DCPOrderBulkService {
    return useState(new DCPOrderBulkService())[0];
}
