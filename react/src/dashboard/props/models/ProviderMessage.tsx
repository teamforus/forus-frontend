export default interface ProviderMessage {
    id: number;
    type?: string;
    type_locale?: string;
    created_at_locale?: string;
    message?: string;
    message_html?: string;
    identity: {
        id: number;
        email?: string;
    };
    employee?: {
        id?: number;
        email?: string;
        identity_address?: string;
    };
}
