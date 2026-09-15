import type IdentityProviderLinkOption from './IdentityProviderLinkOption';

export default interface IdentityProviderLinksMeta {
    available_connections: Array<IdentityProviderLinkOption>;
    can_manage_links: boolean;
    management_message: string | null;
}
