import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { useState } from 'react';
import { ResponseSimple } from '../../dashboard/props/ApiResponses';

export type WalletProvider = 'verid';

export class OpenIdService<T = unknown> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public prefix = '/platform/openid';

    public startAuth(
        target: string | null,
        provider: WalletProvider,
    ): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${provider}/auth`, { target });
    }

    public startFundRequest(
        fund_id: number,
        provider: WalletProvider,
    ): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(`${this.prefix}/${provider}/auth`, { fund_id, request: 'fund_request' });
    }
}

export function useOpenIdService(): OpenIdService {
    return useState(new OpenIdService())[0];
}
