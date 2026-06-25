import Fund from './Fund';
import Product from './Product';

export default interface FundProductLimit {
    id: number;
    fund_id: number;
    state: string;
    type: string;
    type_locale: string;
    limit: number;
    products: Array<Product>;
    fund?: Fund;
    created_at_locale?: string;
}
