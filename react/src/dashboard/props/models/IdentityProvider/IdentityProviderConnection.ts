import IdentityProviderWebshop from './IdentityProviderWebshop';

export type IdentityProviderConnectionStatus = 'enabled' | 'paused' | 'disconnected';

export default interface IdentityProviderConnection {
    uid: string;
    provider: string;
    tenant_id: string;
    issuer: string;
    status: IdentityProviderConnectionStatus;
    consented_at?: string;
    consented_at_locale?: string;
    enabled_at?: string;
    enabled_at_locale?: string;
    paused_at?: string;
    paused_at_locale?: string;
    disconnected_at?: string;
    disconnected_at_locale?: string;
    managed_employees_count: number;
    webshops: Array<IdentityProviderWebshop>;
    last_auth_success_at?: string;
    last_auth_success_at_locale?: string;
    last_auth_failure_at?: string;
    last_auth_failure_at_locale?: string;
    last_auth_failure_code?: string;
}
