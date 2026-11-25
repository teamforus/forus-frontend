import Fund from './Fund';

export default interface FundProductLimit {
    id: number;
    fund_id: number;
    state: string;
    type: string;
    type_locale: string;
    limit_by: 'products' | 'amount';
    limit_by_locale: string;
    limit: number | string;
    limit_locale: string;
    products: Array<{ id: number; name: string }>;
    fund?: Fund;
    created_at_locale?: string;
}
