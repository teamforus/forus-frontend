import React from 'react';
import DCPOrder from '../../../../props/models/DCPOrder';
import Label, { LabelType } from '../../../elements/label/Label';

export default function DCPOrderStateLabel({ order }: { order: DCPOrder }) {
    const types: Record<DCPOrder['state_group'], LabelType> = {
        draft: 'default',
        in_progress: 'primary',
        needs_attention: 'danger',
        completed: 'success',
    };

    return <Label type={types[order.state_group]}>{order.state_locale}</Label>;
}
