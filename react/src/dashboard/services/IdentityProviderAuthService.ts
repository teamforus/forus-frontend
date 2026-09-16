import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import { ApiResponseSingle, ResponseSimple } from '../props/ApiResponses';

type IdentityProviderStart = {
    redirect_url: string;
    session_uid: string;
    browser_token: string;
};

export class IdentityProviderAuthService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public prefix = '/platform/identity-providers/entra';
    public storagePrefix = 'entra_';

    public async exchange(
        sessionUid: string,
        exchangeToken: string,
    ): Promise<ResponseSimple<{ access_token: string; organization_id?: number }>> {
        const browserToken = sessionUid && sessionStorage.getItem(`${this.storagePrefix}${sessionUid}`);

        if (!browserToken) {
            throw new Error('Microsoft sign-in was not started in this tab.');
        }

        try {
            return await this.apiRequest.post(`${this.prefix}/exchange`, {
                exchange_token: exchangeToken,
                browser_token: browserToken,
            });
        } finally {
            this.clearBrowserToken(sessionUid);
        }
    }

    public clearBrowserToken(sessionUid: string): void {
        if (sessionUid) {
            sessionStorage.removeItem(`${this.storagePrefix}${sessionUid}`);
        }
    }

    public async startLogin(target?: string): Promise<ApiResponseSingle<IdentityProviderStart>> {
        const response = await this.apiRequest.post<ApiResponseSingle<IdentityProviderStart>>(`${this.prefix}/login`, {
            target,
        });

        const { session_uid, browser_token } = response.data.data;

        sessionStorage.setItem(`${this.storagePrefix}${session_uid}`, browser_token);

        return response;
    }
}

export function useIdentityProviderAuthService(): IdentityProviderAuthService {
    return useState(new IdentityProviderAuthService())[0];
}
