import ExtraPayment from './ExtraPayment';
import type Media from './Media';
import Transaction from './Transaction';
import FileModel from './File';
import ReservationField from './ReservationField';

export interface ReservationCustomFieldValue {
    id?: number;
    value?: string;
    files?: Array<FileModel>;
    reservation_field: ReservationField;
}

export interface ReservationProduct {
    id: number;
    name: string;
    price: string | null;
    price_locale: string;
    deleted: boolean;
    organization_id: number;
    organization: { id: number; name: string };
    photos: Media[];
}

export interface ProviderReservationProduct extends ReservationProduct {
    expire_at: string | null;
    expire_at_locale: string | null;
    expired: boolean;
    sold_amount: number;
    reserved_amount: number;
    unlimited_stock: boolean;
    stock_amount: number | null;
    ean: string | null;
    sku: string | null;
}

export default interface Reservation {
    id: number;
    code: string;
    amount_extra?: number;
    amount_extra_locale?: number;
    voucher_id?: number;
    extra_payment?: ExtraPayment;
    state?: string;
    state_locale?: string;
    expired?: boolean;
    product: ReservationProduct;
    price?: string;
    price_locale?: string;
    price_voucher?: string;
    price_voucher_locale?: string;
    amount?: string;
    amount_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    birth_date?: string;
    birth_date_locale?: string;
    identity_email?: string;
    identity_physical_card?: string;
    extra_payment_expires_in?: number;
    archivable?: boolean;
    archived?: boolean;
    canceled?: boolean;
    voucher_transaction: Transaction;
    accepted_at?: string;
    accepted_at_locale?: string;
    rejected_at?: string;
    rejected_at_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
    canceled_at?: string;
    canceled_at_locale?: string;
    user_note?: string;
    acceptable?: boolean;
    rejectable?: boolean;
    cancelable?: boolean;
    custom_fields?: Array<ReservationCustomFieldValue>;
    records_title?: string;
    fund: {
        id: number;
        name: string;
        organization: {
            id: number;
            name: string;
        };
    };
    accepted_note?: string;
    cancellation_note?: string;
    rejection_note?: string;
    invoice_number?: string;
    allow_provider_messages?: boolean;
}

export interface ProviderReservation extends Reservation {
    product: ProviderReservationProduct;
}
