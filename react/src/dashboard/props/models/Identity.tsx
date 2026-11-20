export default interface Identity {
    id?: number;
    address?: string;
    bsn: boolean;
    bsn_time?: number;
    email?: string;
    can_manage_emails?: boolean;
    has_identity_provider_links?: boolean;
    can_link_identity_provider?: boolean;
    profile?: boolean;
}
