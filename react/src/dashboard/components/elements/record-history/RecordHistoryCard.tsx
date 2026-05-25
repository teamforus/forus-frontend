import React, { Fragment } from 'react';
import useTranslate from '../../../hooks/useTranslate';
import { ConfigurableTableColumn } from '../../pages/vouchers/hooks/useConfigurableTable';
import LoaderTableCard from '../loader-table-card/LoaderTableCard';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import FundRequestRecord from '../../../props/models/FundRequestRecord';
import PrevalidationRequestRecord from '../../../props/models/PrevalidationRequestRecord';

export default function RecordHistoryCard({
    record,
    columns,
}: {
    record: FundRequestRecord | PrevalidationRequestRecord;
    columns: Array<ConfigurableTableColumn>;
}) {
    const translate = useTranslate();
    const recordType = record.record_type;

    return (
        <div className="card" data-dusk="historyTabContent">
            <div className="card-header">
                <div className="card-title">
                    {translate('validation_request_details.labels.history', { count: record.history.length })}
                </div>
            </div>
            <LoaderTableCard empty={record.history.length == 0} emptyTitle={'Geen historie.'} columns={columns}>
                {record.history?.map((log) => (
                    <tr key={log.id} data-dusk={`recordHistoryRow${log.id}`} className="light">
                        {recordType?.type != 'select' && (
                            <Fragment>
                                <td className="text-strong">{log.new_value}</td>
                                <td className="text-muted">{log.old_value}</td>
                            </Fragment>
                        )}

                        {recordType?.type == 'select' && (
                            <Fragment>
                                <td className="text-strong">
                                    {recordType.options?.find((option) => option.value == log.new_value)?.name ||
                                        'Niet beschikbaar'}
                                </td>
                                <td className="text-muted">
                                    {recordType.options?.find((option) => option.value == log.old_value)?.name ||
                                        'Niet beschikbaar'}
                                </td>
                            </Fragment>
                        )}
                        <td className="text-strong">{log.employee_email}</td>
                        <td>
                            <strong className="text-primary">{log.created_at_locale}</strong>
                        </td>
                        <td className={'table-td-actions text-right'}>
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
