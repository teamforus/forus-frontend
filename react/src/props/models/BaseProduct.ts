import type OrganizationBasic from '../../dashboard/props/models/OrganizationBasic';
import type ProductCategory from '../../dashboard/props/models/ProductCategory';

export type ProductPriceType = 'regular' | 'discount_fixed' | 'discount_percentage' | 'free' | 'informational';

export type ReservationPolicy = 'global' | 'accept' | 'review';
export type ReservationToggle = 'global' | 'no' | 'yes';

export default interface BaseProduct {
    id: number;
    name: string;
    description_html: string;
    sold_out: boolean;
    organization_id: number;
    alternative_text: string | null;
    price: string | null;
    price_locale: string;
    info_duration: string | null;
    info_when: string | null;
    info_where: string | null;
    info_more_info: string | null;
    info_attention: string | null;
    organization: OrganizationBasic;
    expire_at: string | null;
    expire_at_locale: string | null;
    expired: boolean;
    deleted_at: string | null;
    deleted_at_locale: string | null;
    deleted: boolean;
    product_category: ProductCategory | null;
    price_type: ProductPriceType;
}
