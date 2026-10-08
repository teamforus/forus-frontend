export default interface IdentityProviderScimCredential {
    uid: string;
    created_at: string;
    created_at_locale: string;
    revoked_at: string | null;
    revoked_at_locale: string | null;
    last_used_at: string | null;
    last_used_at_locale: string | null;
}
