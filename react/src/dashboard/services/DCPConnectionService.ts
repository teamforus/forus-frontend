import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import DCPConnection, { DCPConnectionOptions } from '../props/models/DCPConnection';
import { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';

export class DCPConnectionService<T = DCPConnection> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     */
    public prefix = '/platform/organizations';

    public show(organizationId: number, implementationId: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/dcp-connection`,
        );
    }

    public update(organizationId: number, implementationId: number, data: object): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/dcp-connection`,
            data,
        );
    }

    public options(organizationId: number, implementationId: number): Promise<ApiResponseSingle<DCPConnectionOptions>> {
        return this.apiRequest.get<ApiResponseSingle<DCPConnectionOptions>>(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/dcp-connection/options`,
        );
    }

    public test(
        organizationId: number,
        implementationId: number,
        data: object,
    ): Promise<ResponseSimple<{ success: boolean; message: string }>> {
        return this.apiRequest.post<ResponseSimple<{ success: boolean; message: string }>>(
            `${this.prefix}/${organizationId}/implementations/${implementationId}/dcp-connection/test`,
            data,
        );
    }
}

export function useDCPConnectionService(): DCPConnectionService {
    return useState(new DCPConnectionService())[0];
}
