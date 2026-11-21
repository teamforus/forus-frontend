import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { VoucherPassChange } from '../../../../props/models/VoucherPass';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Label from '../../../elements/label/Label';

export default function VoucherPassChangesTable({
    changes,
    columnNames,
    estimated,
}: {
    changes: VoucherPassChange[];
    columnNames: Record<string, string>;
    estimated: boolean;
}) {
    const translate = useTranslate();

    const displayValue = (value: VoucherPassChange['value']) => {
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            return <TableEmptyValue />;
        }

        if (typeof value === 'boolean') {
            return translate(value ? 'voucher_passes.yes' : 'voucher_passes.no');
        }

        return Array.isArray(value) ? value.join(', ') : value;
    };

    return (
        <LoaderTableCard
            tableOptions={{ hasTooltips: false }}
            columns={[
                { key: 'field', label: 'voucher_passes.upload.field' },
                {
                    key: 'previous',
                    label: estimated ? 'voucher_passes.upload.current' : 'voucher_passes.upload.previous',
                },
                { key: 'value', label: estimated ? 'voucher_passes.upload.uploaded' : 'voucher_passes.upload.saved' },
                { key: 'action', label: 'voucher_passes.upload.action', headerClassName: 'text-right' },
            ]}>
            {changes.map((change) => (
                <tr key={change.field} className="tr-gray tr-narrow">
                    <td>{columnNames[change.field]}</td>
                    <td>{displayValue(change.previous_value)}</td>
                    <td>{displayValue(change.value)}</td>
                    <td className="text-right">
                        <Label
                            type={
                                change.action === 'add' ? 'success' : change.action === 'update' ? 'primary' : 'warning'
                            }>
                            {translate(
                                `voucher_passes.${estimated ? 'preview_action' : 'result_action'}.${change.action}`,
                            )}
                        </Label>
                    </td>
                </tr>
            ))}
        </LoaderTableCard>
    );
}
