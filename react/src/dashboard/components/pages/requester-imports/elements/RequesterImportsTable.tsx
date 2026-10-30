import React, { useMemo } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import RequesterImportRow, { RequesterImportRecordType } from '../../../../props/models/RequesterImportRow';
import { PaginationData } from '../../../../props/ApiResponses';
import { FilterModel, FilterSetter } from '../../../../modules/filter_next/types/FilterParams';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableRowActions from '../../../elements/tables/TableRowActions';

export default function RequesterImportsTable({
    rows,
    recordTypes,
    loading,
    paginatorKey,
    filterValues,
    filterUpdate,
    onEdit,
}: {
    rows: PaginationData<RequesterImportRow>;
    recordTypes: RequesterImportRecordType[];
    loading: boolean;
    paginatorKey: string;
    filterValues: FilterModel;
    filterUpdate: FilterSetter;
    onEdit: (row: RequesterImportRow) => void;
}) {
    const translate = useTranslate();

    const recordColumns = useMemo(() => {
        const keys = new Set([
            ...(recordTypes || []).map((type) => type.key),
            ...(rows?.data || []).flatMap((row) => row.records.map((record) => record.record_type_key)),
        ]);

        const labels: Record<string, string> = {
            given_name: translate('requester_imports.labels.given_name'),
            family_name: translate('requester_imports.labels.family_name'),
            birth_date: translate('requester_imports.labels.birth_date'),
            client_uuid: translate('requester_imports.labels.client_uuid'),
        };

        return [...keys].map((key) => ({
            key,
            label: recordTypes?.find((type) => type.key === key)?.name || labels[key] || key,
        }));
    }, [recordTypes, rows, translate]);

    return (
        <LoaderTableCard
            loading={loading}
            empty={!rows?.data.length}
            emptyTitle={translate('requester_imports.empty')}
            columns={[
                { key: 'bsn', label: 'requester_imports.labels.bsn' },
                ...recordColumns.map((column) => ({ ...column, key: `record.${column.key}` })),
                { key: 'updated_at', label: 'requester_imports.labels.updated_at' },
                { key: 'actions', label: 'requester_imports.labels.actions' },
            ]}
            tableOptions={{ hasTooltips: false }}
            paginator={{ key: paginatorKey, data: rows, filterValues, filterUpdate }}>
            {rows?.data.map((row) => (
                <tr key={row.id}>
                    <td>{row.bsn}</td>
                    {recordColumns.map((column) => (
                        <td key={column.key}>
                            {row.records.find((record) => record.record_type_key === column.key)?.value || (
                                <TableEmptyValue />
                            )}
                        </td>
                    ))}
                    <td>{row.updated_at_locale}</td>
                    <td className="table-td-actions text-right">
                        <TableRowActions
                            disabled={!recordTypes?.length}
                            content={(menu) => (
                                <div className="dropdown dropdown-actions">
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        onClick={() => {
                                            menu.close();
                                            onEdit(row);
                                        }}>
                                        <em className="mdi mdi-pencil icon-start" />
                                        {translate('requester_imports.buttons.edit')}
                                    </button>
                                </div>
                            )}
                        />
                    </td>
                </tr>
            ))}
        </LoaderTableCard>
    );
}
