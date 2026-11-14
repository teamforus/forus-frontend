import FundFormulaCondition from './FundFormulaCondition';

export default interface FundFormula {
    id: number;
    amount: string;
    amount_locale: string;
    record_type_key: string;
    type: 'fixed' | 'multiply';
    conditions: FundFormulaCondition[] | null;
    record_type_name?: string;
    created_at_locale?: string;
    updated_at_locale?: string;
}
