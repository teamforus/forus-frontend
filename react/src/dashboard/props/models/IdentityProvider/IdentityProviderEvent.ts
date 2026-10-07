export type IdentityProviderEventCategory = 'sso' | 'requester_provisioning';

export default interface IdentityProviderEvent {
    id: number;
    event_type: string;
    event_type_locale: string;
    outcome: string;
    category: IdentityProviderEventCategory | null;
    error_code?: string | null;
    error_code_locale?: string | null;
    account: string | null;
    external_id: string | null;
    identity_id: number | null;
    profile_id: number | null;
    diagnostic_id: string | null;
    requested_fields: Array<{ key: string; name: string }>;
    result: string | null;
    result_locale: string | null;
    next_action_locale: string | null;
    created_at: string;
    created_at_locale: string;
}
