import type Media from '../../dashboard/props/models/Media';
import type { ReservationPolicy } from './BaseProduct';
import type TinyProduct from './TinyProduct';

export default interface SmallProduct extends TinyProduct {
    description: string;
    description_html: string;
    product_category_id: number;
    sold_out: boolean;
    qr_enabled: boolean;
    organization_id: number;
    reservation_enabled: boolean;
    reservation_policy: ReservationPolicy;
    alternative_text: string | null;
    info_duration: string | null;
    info_when: string | null;
    info_where: string | null;
    info_more_info: string | null;
    info_attention: string | null;
    price: string | null;
    price_locale: string;
    organization: { id: number; name: string };
    photo: Media | null;
}
