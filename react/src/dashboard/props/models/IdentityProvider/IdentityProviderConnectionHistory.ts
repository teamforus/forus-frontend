export default interface IdentityProviderConnectionHistory {
    uid: string;
    tenant_id: string;
    status: 'disconnected';
    consented_at?: string;
    consented_at_locale?: string;
    disconnected_at?: string;
    disconnected_at_locale?: string;
}
