import Fund from './Fund';

export default interface FundProductLimit {
    id: number;
    fund_id: number;
    state: string;
    type: string;
    type_locale: string;
    limit: number;
    products: Array<{ id: number; name: string }>;
    fund?: Fund;
    created_at_locale?: string;
}
