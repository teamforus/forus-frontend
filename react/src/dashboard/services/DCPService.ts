import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import DCPOrder, { DCPOrderListMeta, DCPOrderState, DCPOrderStateGroup } from '../props/models/DCPOrder';
import DCPOrderBulk from '../props/models/DCPOrderBulk';
import DCPEventLog from '../props/models/DCPEventLog';

export interface DCPOrderFilters {
    q?: string;
    state?: DCPOrderState | '';
    state_group?: DCPOrderStateGroup | '';
    dcp_order_bulk_id?: number;
    page?: number;
    per_page?: number;
}

export class DCPService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public orders(
        organizationId: number,
        filters: DCPOrderFilters,
        config: RequestConfig = {},
    ): Promise<ApiResponse<DCPOrder, DCPOrderListMeta>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/dcp-orders`,
            { ...filters, with_counts: 1 },
            config,
        );
    }

    public order(organizationId: number, id: number, config: RequestConfig = {}): Promise<ApiResponseSingle<DCPOrder>> {
        return this.apiRequest.get(`/platform/organizations/${organizationId}/sponsor/dcp-orders/${id}`, {}, config);
    }

    public bulks(
        organizationId: number,
        filters: { q?: string; page?: number; per_page?: number },
        config: RequestConfig = {},
    ): Promise<ApiResponse<DCPOrderBulk>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/dcp-order-bulks`,
            filters,
            config,
        );
    }

    public bulk(
        organizationId: number,
        id: number,
        config: RequestConfig = {},
    ): Promise<ApiResponseSingle<DCPOrderBulk>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/dcp-order-bulks/${id}`,
            {},
            config,
        );
    }

    public readyCount(
        organizationId: number,
        config: RequestConfig = {},
    ): Promise<ApiResponseSingle<{ count: number }>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/dcp-order-bulks/ready-count`,
            {},
            config,
        );
    }

    public approve(organizationId: number): Promise<ApiResponseSingle<DCPOrderBulk>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/sponsor/dcp-order-bulks`);
    }

    public logs(
        organizationId: number,
        type: 'order' | 'bulk',
        id: number,
        filters: { page?: number; per_page?: number },
        config: RequestConfig = {},
    ): Promise<ApiResponse<DCPEventLog>> {
        const path = type === 'order' ? 'dcp-orders' : 'dcp-order-bulks';

        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/sponsor/${path}/${id}/logs`,
            filters,
            config,
        );
    }
}

export function useDCPService(): DCPService {
    return useState(() => new DCPService())[0];
}
