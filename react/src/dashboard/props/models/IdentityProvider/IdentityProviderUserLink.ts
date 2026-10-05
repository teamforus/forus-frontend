import IdentityProviderOrganizationReference from './IdentityProviderOrganizationReference';

export default interface IdentityProviderUserLink {
    uid: string;
    provider: 'entra';
    organization: IdentityProviderOrganizationReference;
    tenant_id: string;
    claim_state: string;
    consented_at?: string;
    consented_at_locale?: string;
}
