export default interface FundFormulaCondition {
    record_type_key: string;
    record_type_name: string;
    operator: '=' | '<' | '<=' | '>' | '>=';
    value: string;
    value_locale: string;
}
