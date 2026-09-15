import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import type IdentityProviderConnection from '../props/models/IdentityProvider/IdentityProviderConnection';
import type IdentityProviderEvent from '../props/models/IdentityProvider/IdentityProviderEvent';
import type IdentityProviderConnectionHistory from '../props/models/IdentityProvider/IdentityProviderConnectionHistory';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';

export class IdentityProviderConnectionService {
    public constructor(protected apiRequest = new ApiRequestService()) {}

    public getHistoryColumns(): Array<ConfigurableTableColumn> {
        return [
            { key: 'tenant_id', label: 'organizations_identity_provider_entra.ui.tenant_id' },
            { key: 'consented_at', label: 'organizations_identity_provider_entra.ui.connected_at' },
            { key: 'disconnected_at', label: 'organizations_identity_provider_entra.ui.disconnected_at' },
            { key: 'actions', label: '' },
        ];
    }

    public getEventsColumns(): Array<ConfigurableTableColumn> {
        return [
            { key: 'created_at', label: 'organizations_identity_provider_entra.ui.created_at' },
            { key: 'event_type', label: 'organizations_identity_provider_entra.ui.event' },
            { key: 'outcome', label: 'organizations_identity_provider_entra.ui.outcome' },
            { key: 'error_code', label: 'organizations_identity_provider_entra.ui.error' },
        ];
    }

    public getWebshopsColumns(): Array<ConfigurableTableColumn> {
        return [
            { key: 'name', label: 'organizations_identity_provider_entra.ui.webshop' },
            { key: 'url_webshop', label: 'organizations_identity_provider_entra.ui.webshop_url' },
            { key: 'entra_login_enabled', label: 'organizations_identity_provider_entra.ui.selected_cms' },
            { key: 'actions', label: '' },
        ];
    }

    public connection(
        organizationId: number,
        config: RequestConfig = {},
    ): Promise<ApiResponseSingle<IdentityProviderConnection | null>> {
        return this.apiRequest.get(`/platform/organizations/${organizationId}/identity-providers/entra`, {}, config);
    }

    public events(
        organizationId: number,
        connectionUid: string,
        query: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<IdentityProviderEvent>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections/${connectionUid}/events`,
            query,
            config,
        );
    }

    public history(
        organizationId: number,
        query: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<IdentityProviderConnectionHistory>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections`,
            query,
            config,
        );
    }

    public read(
        organizationId: number,
        connectionUid: string,
        config: RequestConfig = {},
    ): Promise<ApiResponseSingle<IdentityProviderConnection>> {
        return this.apiRequest.get(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections/${connectionUid}`,
            {},
            config,
        );
    }

    public startConsent(organizationId: number): Promise<ApiResponseSingle<{ redirect_url: string }>> {
        return this.apiRequest.post(`/platform/organizations/${organizationId}/identity-providers/entra/consent`);
    }

    public pause(
        organizationId: number,
        connectionUid: string,
    ): Promise<ApiResponseSingle<IdentityProviderConnection>> {
        return this.apiRequest.post(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections/${connectionUid}/pause`,
        );
    }

    public resume(
        organizationId: number,
        connectionUid: string,
    ): Promise<ApiResponseSingle<IdentityProviderConnection>> {
        return this.apiRequest.post(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections/${connectionUid}/resume`,
        );
    }

    public disconnect(
        organizationId: number,
        connectionUid: string,
    ): Promise<ApiResponseSingle<IdentityProviderConnection>> {
        return this.apiRequest.post(
            `/platform/organizations/${organizationId}/identity-providers/entra/connections/${connectionUid}/disconnect`,
        );
    }
}

export function useIdentityProviderConnectionService(): IdentityProviderConnectionService {
    return useState(new IdentityProviderConnectionService())[0];
}
