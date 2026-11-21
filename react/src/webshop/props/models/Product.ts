import type BaseProduct from '../../../props/models/BaseProduct';
import type { ProductPriceType } from '../../../props/models/BaseProduct';
import type ReservationField from '../../../dashboard/props/models/ReservationField';

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
    type: ProductPriceType;
    value: string;
}

export interface ProductFund {
    id: number;
    name: string;
    logo: SmallMedia | null;
    user_price: UserPrice;
    limit: number | null;
    end_at: string | null;
    end_at_locale: string | null;
    expire_at: string;
    expire_at_locale: string;
    feature_scanning_enabled: boolean;
    feature_reservations_enabled: boolean;
    feature_reservation_extra_payments_enabled: boolean;
}

export default interface RequesterProduct extends BaseProduct {
    bookmarked: boolean;
    price_min: string;
    price_min_locale: string;
    funds: ProductFund[];
    feature_scanning_enabled: boolean;
    feature_reservations_enabled: boolean;
    feature_reservation_extra_payments_enabled: boolean;
    photos: SmallMedia[];
    offices: ProductOffice[];
    reservation: {
        address: 'no' | 'optional' | 'required';
        birth_date: 'no' | 'optional' | 'required';
        note: 'no' | 'optional' | 'required';
        fields: Array<Required<ReservationField>>;
        phone: 'no' | 'optional' | 'required';
    };
}
