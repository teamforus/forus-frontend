export interface DCPOrderField {
    key: string;
    value?: string;
    required: boolean;
    errors: Array<string>;
}

export interface DCPOrderTagField extends DCPOrderField {
    max?: number;
    source?: string;
    source_locale?: string;
}

export default interface DCPOrder {
    id: number;
    organization_id: number;
    dcp_order_bulk_id?: number;
    orderable_type: string;
    orderable_id: number;
    order_id: string;
    order_id_dcp?: string;
    state: 'pending' | 'sent' | 'error' | 'closed' | 'canceled';
    status_id?: number;
    status_message?: string;
    status_locale?: string;
    attempts: number;
    response_code?: string;
    label?: string;
    item?: string;
    delivery_address: {
        fullname?: string;
        address1?: string;
        zipcode?: string;
        city?: string;
        country?: string;
    };
    delivery_address_fields: Array<DCPOrderField>;
    tag_fields: Array<DCPOrderTagField>;
    validation_errors: Array<string>;
    orderable?: {
        name: string;
        voucher_id?: number;
        voucher_number?: string;
    };
    implementation?: {
        id: number;
        name: string;
    };
    dcp_connection_active: boolean;
    is_editable: boolean;
    is_duplicate: boolean;
    payload_edited_at?: string;
    payload_edited_at_locale?: string;
    payload_edited_by_employee_email?: string;
    created_at: string;
    created_at_locale: string;
    shipped_at?: string;
    shipped_at_locale?: string;
    last_attempt_at?: string;
    last_attempt_at_locale?: string;
}
