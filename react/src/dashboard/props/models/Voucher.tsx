import type { InlineFundPhysicalCardType } from './Fund';
import Office from './Office';
import Reservation from './Reservation';
import PhysicalCard from './PhysicalCard';
import Media from './Media';
import OrganizationBasic from './OrganizationBasic';
import type BaseTransaction from '../../../props/models/BaseTransaction';
import type BaseVoucher from '../../../props/models/BaseVoucher';
import type SmallProduct from '../../../props/models/SmallProduct';
import Reimbursement from './Reimbursement';

export interface VoucherFundPayoutButtons {
    vouchers: boolean;
    payouts: boolean;
    products: boolean;
}

export interface VoucherFund {
    id: number;
    state: 'active' | 'closed' | 'paused' | 'waiting';
    type: 'budget' | 'subsidies' | 'external';
    name: string;
    description_short: string | null;
    how_it_works_html: string | null;
    url_webshop: string | null;
    logo: Media | null;
    organization: OrganizationBasic;
    allow_physical_cards: boolean;
    allow_blocking_vouchers: boolean;
    fund_physical_card_types: InlineFundPhysicalCardType[];
    allow_reimbursements: boolean;
    show_qr_code: boolean;
    allow_voucher_payouts: boolean;
    allow_voucher_payout_count: number | null;
    hide_voucher_amount: boolean;
    allow_voucher_payout_note: string | null;
    allow_voucher_payout_buttons: VoucherFundPayoutButtons;
    voucher_payout_fixed_amount: string | null;
}

export interface VoucherProduct {
    id?: number;
    name?: string;
    description?: string;
    description_html?: string;
    product_category_id?: number;
    sold_out?: boolean;
    reservation_enabled?: boolean;
    reservation_policy?: 'accept' | 'review' | 'global';
    alternative_text?: string;
    price?: string;
    price_locale?: string;
    organization_id?: number;
    photos?: Media[];
    organization?: OrganizationBasic;
}

export interface VoucherTransaction extends BaseTransaction {
    id: number;
    organization_id: number;
    product_id?: number;
    address: string;
    payment_id?: string;
    target?: 'provider' | 'iban' | 'top_up' | 'payout';
    initiator?: 'provider' | 'sponsor' | 'requester';
    amount: string;
    amount_locale: string;
    amount_extra_cash?: string;
    amount_extra_cash_locale?: string;
    timestamp: number;
    cancelable: boolean;
    transfer_in?: number;
    organization: {
        id: number;
        name: string;
        logo: Media;
    };
    product: SmallProduct | null;
    fund: {
        id: number;
        name: string;
        organization_id: number;
        logo?: Media;
        organization_name: string;
    };
    created_at: string;
    created_at_locale: string;
    transfer_at?: string;
    transfer_at_locale?: string;
    updated_at: string;
    product_reservation?: Reservation;
    reimbursement?: Reimbursement;
}

export default interface Voucher extends BaseVoucher {
    number?: string;
    address?: string;
    expired?: boolean;
    fund: VoucherFund;
    type?: 'regular' | 'product';
    timestamp?: number;
    transactions: Array<VoucherTransaction>;
    product_vouchers?: Array<{
        amount: string;
        amount_locale: string;
        timestamp: number;
        product: VoucherProduct;
        product_reservation: { id: number; code: string } | null;
        created_at: string;
        created_at_locale: string;
    }>;
    records?: Array<{
        voucher_id: number;
        value_locale: string;
        record_type_key: string;
        record_type_name: string;
    }>;
    product: VoucherProduct;
    product_reservation: Reservation;
    offices?: Array<Office>;
    query_product?: {
        reservable?: boolean;
        reservable_expire_at?: string;
        reservable_expire_at_locale?: string;
    };
    physical_card?: PhysicalCard;
    amount?: string;
    amount_locale?: string;
    external: boolean;
    history: Array<{
        id: number;
        event: string;
        event_locale: string;
        created_at: string;
        created_at_locale: string;
    }>;
    deactivated?: boolean;
    used: boolean;
    last_transaction_at?: string;
    last_transaction_at_locale?: string;
    records_title?: string;
    returnable?: boolean;
    last_active_day_locale?: string;
    expire_at?: string;
    expire_at_locale?: string;
    requester_payouts_count?: number;
    voucher_payout_partial_amounts?: Array<string> | null;
    voucher_payout_partial_amounts_label_type?: 'persons' | null;
    voucher_payout_has_valid_records?: boolean;
}
