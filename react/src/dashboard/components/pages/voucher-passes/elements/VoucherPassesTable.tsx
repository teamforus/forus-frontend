import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import VoucherPass from '../../../../props/models/VoucherPass';
import { PaginationData } from '../../../../props/ApiResponses';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';
import TableRowActionItem from '../../../elements/tables/TableRowActionItem';
import Label from '../../../elements/label/Label';

export default function VoucherPassesTable({
    rows,
    loading,
    paginatorKey,
    filterValues,
    filterUpdate,
    onEdit,
}: {
    rows: PaginationData<VoucherPass>;
    loading: boolean;
    paginatorKey: string;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    onEdit: (pass: VoucherPass) => void;
}) {
    const translate = useTranslate();

    return (
        <LoaderTableCard
            loading={loading}
            empty={!rows?.data.length}
            emptyTitle={translate('voucher_passes.empty')}
            columns={[
                'id',
                'external_id',
                'code',
                'owner_bsn',
                'target_bsn',
                'type_names',
                'fund_ids',
                'print_label',
                'state',
                'print_requested',
                'updated_at',
            ].map((key) => ({
                key,
                label: `voucher_passes.fields.${key}`,
                tooltip: { key, title: `voucher_passes.fields.${key}`, description: `voucher_passes.tooltips.${key}` },
            }))}
            paginator={{ key: paginatorKey, data: rows, filterValues, filterUpdate }}>
            {rows?.data.map((pass) => (
                <tr key={pass.id}>
                    <td>{pass.id}</td>
                    <td>{pass.external_id || <TableEmptyValue />}</td>
                    <td>{pass.code}</td>
                    <td>{pass.owner_bsn}</td>
                    <td>{pass.target_bsn}</td>
                    <td>{pass.types.map((type) => type.name).join(', ') || <TableEmptyValue />}</td>
                    <td>{pass.fund_ids.join(', ') || <TableEmptyValue />}</td>
                    <td>{pass.print_label || <TableEmptyValue />}</td>
                    <td>
                        <Label type={pass.state === 'active' ? 'success' : 'default'}>
                            {translate(`voucher_passes.${pass.state}`)}
                        </Label>
                    </td>
                    <td>{translate(pass.print_requested ? 'voucher_passes.yes' : 'voucher_passes.no')}</td>
                    <td>{pass.updated_at_locale}</td>
                    <td className="table-td-actions text-right">
                        <TableRowActions
                            content={(menu) => (
                                <div className="dropdown dropdown-actions">
                                    <TableRowActionItem
                                        type="button"
                                        onClick={() => {
                                            menu.close();
                                            onEdit(pass);
                                        }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        {translate('voucher_passes.buttons.edit')}
                                    </TableRowActionItem>
                                </div>
                            )}
                        />
                    </td>
                </tr>
            ))}
        </LoaderTableCard>
    );
}
