import FundFormulaCondition from '../../../webshop/props/models/FundFormulaCondition';

export default interface FundFormulaProduct {
    id?: number;
    product_id: number;
    record_type_key_multiplier: string;
    conditions?: FundFormulaCondition[] | null;
}
