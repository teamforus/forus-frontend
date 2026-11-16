export type DCPOrderState =
    | 'draft'
    | 'approved'
    | 'sending'
    | 'accepted'
    | 'rejected'
    | 'unknown'
    | 'closed'
    | 'canceled'
    | 'blocked';

export type DCPOrderStateGroup = 'draft' | 'in_progress' | 'needs_attention' | 'completed';

export type DCPOrderCounts = Record<DCPOrderState, number>;

export interface DCPOrderListMeta {
    can_approve: boolean;
    counts: Record<'all' | DCPOrderStateGroup, number>;
}

export interface DCPCardData {
    key: string;
    printedCardType?: string;
    printedFirstName: string;
    printedLastName: string;
    printedDateOfBirth: string;
    printedCityCode: string;
    printedQrCode: string;
    printedCardNumber: string;
}

export default interface DCPOrder {
    id: number;
    organization_id: number;
    dcp_connection_id: number;
    dcp_order_bulk_id: number | null;
    employee_id: number | null;
    employee_email: string | null;
    orderable_type: string;
    orderable_id: number;
    order_id: string;
    order_id_dcp: string | null;
    label: string;
    state: DCPOrderState;
    state_locale: string;
    state_group: DCPOrderStateGroup;
    status_id: number | null;
    status_locale: string | null;
    status_message: string | null;
    diagnostic_id: string | null;
    source: { type: 'voucher_pass'; id: number; code: string } | null;
    connection: {
        id: number;
        environment: 'sandbox' | 'production';
        implementation: { id: number; name: string };
    };
    delivery_address: {
        first_name: string;
        last_name: string;
        address1: string;
        postal_code: string;
        city: string;
        country: string;
    };
    order_rows: { key: string; item: string; tagIds: DCPCardData[] }[];
    approved_at: string | null;
    approved_at_locale: string | null;
    sending_at: string | null;
    sending_at_locale: string | null;
    submitted_at: string | null;
    submitted_at_locale: string | null;
    last_status_checked_at: string | null;
    last_status_checked_at_locale: string | null;
    shipped_at: string | null;
    shipped_at_locale: string | null;
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}
