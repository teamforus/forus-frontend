import IdentityProviderOrganizationReference from './IdentityProviderOrganizationReference';

export default interface IdentityProviderLinkOption {
    uid: string;
    provider: 'entra';
    organization: IdentityProviderOrganizationReference;
}
