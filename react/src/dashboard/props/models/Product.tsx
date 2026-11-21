import type BaseProduct from '../../../props/models/BaseProduct';
import type { ReservationPolicy, ReservationToggle } from '../../../props/models/BaseProduct';
import type Media from './Media';
import type OrganizationBasic from './OrganizationBasic';
import type ReservationField from './ReservationField';

export type ReservationFieldRequirement = 'global' | 'no' | 'optional' | 'required';
export type ReservationNoteMode = 'global' | 'no' | 'custom';

export default interface ProviderProduct extends BaseProduct {
    qr_enabled: boolean;
    reservation_enabled: boolean;
    reservation_policy: ReservationPolicy;
    description: string;
    product_category_id: number;
    total_amount: number;
    unlimited_stock: boolean;
    reserved_amount: number;
    sold_amount: number;
    stock_amount: number | null;
    sponsor_organization_id: number | null;
    sponsor_organization: OrganizationBasic | null;
    reservation_extra_payments: ReservationToggle;
    unseen_messages: number;
    excluded_funds: Array<{ id: number }>;
    sku: string | null;
    ean: string | null;
    photos: Media[];
    price_discount: string | null;
    reservation_fields_enabled: boolean;
    reservation_phone: ReservationFieldRequirement;
    reservation_address: ReservationFieldRequirement;
    reservation_birth_date: ReservationFieldRequirement;
    reservation_note: ReservationNoteMode;
    reservation_note_text: string | null;
    reservation_fields_config: ReservationToggle;
    reservation_fields: Array<Required<ReservationField>>;
    available_reservation_fields_for_provider: Array<Required<ReservationField>>;
}
