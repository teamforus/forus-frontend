import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import DCPOrder from '../props/models/DCPOrder';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import { DCPOrderStateGroup } from '../components/pages/dcp-orders/elements/DCPOrderState';

export type DCPOrderCounts = { [key in DCPOrderStateGroup | 'all']: number };

export class DCPOrderService<T = DCPOrder> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     */
    public prefix = '/platform/organizations';

    public list(
        organizationId: number,
        data: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<T, { counts?: DCPOrderCounts }>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/dcp-orders`, data, config);
    }

    public show(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/dcp-orders/${id}`);
    }

    public update(
        organizationId: number,
        id: number,
        data: { delivery_address: { [key: string]: string }; tags: { [key: string]: string } },
    ): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/dcp-orders/${id}`, data);
    }

    public resetPayload(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/dcp-orders/${id}/reset-payload`);
    }

    public setOrderIdDcp(organizationId: number, id: number, orderIdDcp: string): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/dcp-orders/${id}/order-id-dcp`, {
            order_id_dcp: orderIdDcp,
        });
    }

    public retry(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/dcp-orders/${id}/retry`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['id', 'recipient', 'address', 'source', 'created_at', 'order_id_dcp', 'state', 'shipped_at'];

        return list.map((key) => ({
            key,
            label: `dcp_orders.labels.${key}`,
            tooltip: {
                key: key,
                title: `dcp_orders.labels.${key}`,
                description: `dcp_orders.tooltips.${key}`,
            },
        }));
    }
}

export function useDCPOrderService(): DCPOrderService {
    return useState(new DCPOrderService())[0];
}
