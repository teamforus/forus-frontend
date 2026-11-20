import type BaseProduct from '../../../props/models/BaseProduct';
import type { ProductFund, ReservationToggle } from '../../../props/models/BaseProduct';
import type Media from './Media';
import type Office from './Office';
import type ReservationField from './ReservationField';

export type ReservationFieldRequirement = 'global' | 'no' | 'optional' | 'required';
export type ReservationNoteMode = 'global' | 'no' | 'custom';

export default interface Product extends BaseProduct {
    funds: Array<
        ProductFund & {
            limit_total?: number;
            limit_available?: number;
            limit_per_identity?: number;
            limit_total_unlimited?: boolean;
        }
    >;
    photos?: Media[];
    offices: Array<Office>;
    price_discount: string | null;
    reservation_fields_enabled: boolean;
    reservation_phone: ReservationFieldRequirement;
    reservation_address: ReservationFieldRequirement;
    reservation_birth_date: ReservationFieldRequirement;
    reservation_note: ReservationNoteMode;
    reservation_note_text: string;
    reservation_fields_config: ReservationToggle;
    reservation_fields: Array<ReservationField>;
    available_reservation_fields_for_provider: Array<ReservationField>;
}
