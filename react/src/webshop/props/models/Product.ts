import BaseProduct, { ProductFund } from '../../../props/models/BaseProduct';
import type { ProductPriceType } from '../../../props/models/BaseProduct';

interface SmallMedia {
    sizes: {
        thumbnail: string | null;
        small: string | null;
        large: string | null;
    };
}

export interface ProductOffice {
    id: number;
    organization_id: number;
    address: string;
    phone: string | null;
    lat: string | null;
    lon: string | null;
    photo: SmallMedia | null;
}

interface UserPrice {
    type: Exclude<ProductPriceType, 'payout'>;
    value: string;
}

export default interface Product extends BaseProduct {
    funds: Array<ProductFund & { user_price: UserPrice; limit: number | null }>;
    feature_scanning_enabled: boolean;
    feature_reservations_enabled: boolean;
    feature_reservation_extra_payments_enabled: boolean;
    photos: SmallMedia[];
    offices: ProductOffice[];
    reservation?: {
        address: 'no' | 'optional' | 'required';
        birth_date: 'no' | 'optional' | 'required';
        note: 'no' | 'optional';
        fields: Array<{
            id?: number;
            type?: 'text' | 'number' | 'boolean' | 'file';
            label?: string;
            required?: boolean;
            description?: string;
        }>;
        phone: 'no';
    };
}
