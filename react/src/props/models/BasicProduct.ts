import type { ReservationPolicy } from './BaseProduct';

export default interface BasicProduct {
    id: number;
    name: string;
    description_html: string;
    sold_out: boolean;
    organization_id: number;
    qr_enabled: boolean;
    reservation_enabled: boolean;
    reservation_policy: ReservationPolicy;
    alternative_text: string | null;
    price: string | null;
    price_locale: string;
    organization: { id: number; name: string };
    info_duration: string | null;
    info_when: string | null;
    info_where: string | null;
    info_more_info: string | null;
    info_attention: string | null;
}
