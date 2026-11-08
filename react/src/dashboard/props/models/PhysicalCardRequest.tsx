import DCPOrder from './DCPOrder';

export default interface PhysicalCardRequest {
    id?: string;
    address?: string;
    house?: string;
    house_addition?: string;
    postcode?: string;
    city?: string;
    first_name?: string;
    last_name?: string;
    card_code?: string;
    created_at?: string;
    created_at_locale?: string;
    physical_card_type?: {
        id: number;
        name: string;
    };
    dcp_order?: DCPOrder;
}
