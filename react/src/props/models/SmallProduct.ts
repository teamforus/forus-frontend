import type Media from '../../dashboard/props/models/Media';
import type BasicProduct from './BasicProduct';

export default interface SmallProduct extends BasicProduct {
    description: string;
    product_category_id: number;
    photos: Media[];
    photo: Media | null;
}
