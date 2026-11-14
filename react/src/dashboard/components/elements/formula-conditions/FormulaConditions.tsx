import React from 'react';
import FundFormulaCondition from '../../../../webshop/props/models/FundFormulaCondition';

export default function FormulaConditions({ conditions }: { conditions?: FundFormulaCondition[] | null }) {
    return conditions?.map((condition, index) => (
        <div key={index}>
            {condition.record_type_name} <span className="text-muted">{condition.operator}</span>{' '}
            {condition.value_locale}
        </div>
    ));
}
