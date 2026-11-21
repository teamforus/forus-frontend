import type { ProductPriceType } from '../../../props/models/BaseProduct';
import type SmallProduct from '../../../props/models/SmallProduct';
import type Media from './Media';
import type OrganizationBasic from './OrganizationBasic';
import type ProductCategory from './ProductCategory';

interface VoucherProductPrices {
    price_user: string;
    price_user_locale: string;
    sponsor_subsidy: string | null;
    sponsor_subsidy_locale: string;
}

interface VoucherProductDeal {
    id: number;
    name: string;
    sold_out: boolean;
    organization_id: number;
    expired: boolean;
    unlimited_stock: boolean;
    price_type: ProductPriceType;
    price_discount: string | null;
    price: string;
    price_locale: string;
    expire_at: string;
    expire_at_locale: string | null;
    photo: Media | null;
    sponsor: OrganizationBasic;
    product_category: ProductCategory | null;
}

type VoucherProviderProduct = (SmallProduct | VoucherProductDeal) &
    VoucherProductPrices & {
        organization: OrganizationBasic;
    };

export default VoucherProviderProduct;
