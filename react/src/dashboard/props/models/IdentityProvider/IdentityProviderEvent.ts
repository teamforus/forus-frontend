export default interface IdentityProviderEvent {
    id: number;
    event_type: string;
    event_type_locale: string;
    outcome: string;
    error_code?: string;
    error_code_locale?: string | null;
    created_at: string;
    created_at_locale: string;
}
