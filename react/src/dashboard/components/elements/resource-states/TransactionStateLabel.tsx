import React from 'react';
import type BaseTransaction from '../../../../props/models/BaseTransaction';
import Label from '../label/Label';

export default function TransactionStateLabel({ transaction }: { transaction: BaseTransaction }) {
    return <Label type={transaction.state == 'success' ? 'success' : 'default'}>{transaction.state_locale}</Label>;
}
