import type Organization from '../../dashboard/props/models/Organization';
import type ProductCategory from '../../dashboard/props/models/ProductCategory';
import type Fund from '../../dashboard/props/models/Fund';
import type Voucher from '../../dashboard/props/models/Voucher';

export type ProductPriceType =
    | 'regular'
    | 'discount_fixed'
    | 'discount_percentage'
    | 'free'
    | 'informational'
    | 'payout';

export type ReservationPolicy = 'global' | 'accept' | 'review';
export type ReservationToggle = 'global' | 'no' | 'yes';

export type ProductFund = Fund & {
    organization: {
        id: number;
        name: string;
    };
    end_at: string;
    end_at_locale: string;
    feature_scanning_enabled: boolean;
    feature_reservations_enabled: boolean;
    feature_reservation_extra_payments_enabled: boolean;
    fund_id?: number;
    price?: string;
    price_locale?: string;
    amount?: string;
    amount_locale?: string;
    payment_type?: 'subsidy' | 'budget';
    payment_type_locale?: string;
    vouchers?: Array<Voucher>;
    fund_providers?: Array<Organization>;
};

export default interface BaseProduct {
    id: number;
    name: string;
    description: string;
    description_html: string;
    product_category_id: number;
    sold_out: boolean;
    organization_id: number;
    qr_enabled: boolean;
    reservation_enabled: boolean;
    reservation_policy: ReservationPolicy;
    alternative_text?: string;
    price: string;
    price_locale: string;
    organization: Organization;
    total_amount: number;
    unlimited_stock: boolean;
    reserved_amount: number;
    sold_amount: number;
    stock_amount?: number;
    expire_at: string;
    expire_at_locale: string;
    expired: boolean;
    deleted_at?: string;
    deleted_at_locale?: string;
    deleted: boolean;
    funds: Array<ProductFund>;
    product_category: ProductCategory;
    bookmarked: boolean | null;
    price_type: ProductPriceType;
    price_min?: string;
    price_min_locale?: string;
    reservation_extra_payments: ReservationToggle;
    sponsor_organization_id?: number;
    sponsor_organization?: {
        id: number;
        name: string;
    };
    unseen_messages: number;
    excluded_funds: Array<{
        id: number;
        name: string;
        state: 'active' | 'closed' | 'paused' | 'waiting';
        expire_at: string;
    }>;
    is_available?: boolean;
    ean?: string;
    sku?: string;
    updated_at?: string;
    updated_at_locale?: string;
    created_at?: string;
    created_at_locale?: string;
    info_duration?: string;
    info_when?: string;
    info_where?: string;
    info_more_info?: string;
    info_attention?: string;
}
