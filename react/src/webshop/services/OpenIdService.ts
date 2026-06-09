import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { useState } from 'react';
import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import type { OpenIdFlow } from '../../dashboard/props/models/OpenIdFlow';

export class OpenIdService<T = unknown> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public prefix = '/platform/openid';

    public startAuth(target: string | null, flow: OpenIdFlow): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(`${this.prefix}/auth`, { target, flow_id: flow.id });
    }

    public startFundRequest(fund_id: number, flow: OpenIdFlow): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(`${this.prefix}/auth`, {
            fund_id,
            request: 'fund_request',
            flow_id: flow.id,
        });
    }
}

export function useOpenIdService(): OpenIdService {
    return useState(new OpenIdService())[0];
}
