import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig, ResponseSimple } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import type IdentityProviderUserLink from '../props/models/IdentityProvider/IdentityProviderUserLink';
import type IdentityProviderLinksMeta from '../props/models/IdentityProvider/IdentityProviderLinksMeta';

type IdentityProviderStart = {
    redirect_url: string;
    session_uid: string;
    browser_token: string;
};

export class IdentityProviderLinkService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public prefix = '/platform/identity-providers/entra';
    public storagePrefix = 'entra_link_';

    public links(
        query: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<IdentityProviderUserLink, IdentityProviderLinksMeta>> {
        return this.apiRequest.get(`${this.prefix}/links`, query, config);
    }

    public async startLink(connectionUid: string): Promise<ApiResponseSingle<IdentityProviderStart>> {
        const response = await this.apiRequest.post<ApiResponseSingle<IdentityProviderStart>>(
            `${this.prefix}/connections/${connectionUid}/links`,
        );

        const { session_uid, browser_token } = response.data.data;
        sessionStorage.setItem(`${this.storagePrefix}${session_uid}`, browser_token);

        return response;
    }

    public async completeLink(sessionUid: string, exchangeToken: string): Promise<ResponseSimple<null>> {
        const browserToken = sessionUid && sessionStorage.getItem(`${this.storagePrefix}${sessionUid}`);

        if (!browserToken) {
            throw new Error('Account linking was not started in this tab.');
        }

        try {
            return await this.apiRequest.post(`${this.prefix}/links/${sessionUid}/complete`, {
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

    public unlink(membershipUid: string): Promise<ResponseSimple<null>> {
        return this.apiRequest.delete(`${this.prefix}/links/${membershipUid}`);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        return [
            { key: 'organization', label: 'organizations_identity_provider_entra.ui.organization' },
            { key: 'provider', label: 'organizations_identity_provider_entra.ui.provider' },
            { key: 'actions', label: '' },
        ];
    }
}

export function useIdentityProviderLinkService(): IdentityProviderLinkService {
    return useState(new IdentityProviderLinkService())[0];
}
