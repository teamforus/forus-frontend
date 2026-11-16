export default interface DCPEventLog {
    id: number;
    event: string;
    event_locale: string;
    identity_email: string | null;
    diagnostic_id: string | null;
    created_at: string;
    created_at_locale: string;
}
