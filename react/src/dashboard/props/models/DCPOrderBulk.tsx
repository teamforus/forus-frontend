export default interface DCPOrderBulk {
    id: number;
    organization_id: number;
    state: 'pending' | 'sent' | 'error';
    state_locale: string;
    employee_email?: string;
    dcp_orders_count: number;
    dcp_orders_pending_count: number;
    dcp_orders_sent_count: number;
    dcp_orders_error_count: number;
    created_at: string;
    created_at_locale: string;
    processed_at?: string;
    processed_at_locale?: string;
}
