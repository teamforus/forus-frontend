import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { RequesterImportSyncResult } from '../types';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Label from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';
import RequesterImportSyncErrors from './RequesterImportSyncErrors';
import { syncResultColumns, syncResultLabelTypes } from '../constants';

export default function RequesterImportSyncResultsCard({
    results,
    organizationId,
    footer,
    notice,
    title,
    skipUnchanged,
}: {
    results: RequesterImportSyncResult[];
    organizationId: number;
    footer: ReactNode;
    notice?: ReactNode;
    title?: string;
    skipUnchanged: boolean;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [paginatorKey] = useState('requester_import_sync_results');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const filteredRows = useMemo(() => {
        return results.filter((row) => status === 'all' || row.status === status);
    }, [results, status]);

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(filteredRows.length, paginatorKey);

    const toggleRow = (id: number) => {
        setExpandedRows((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {title || translate('requester_imports.sync.results_title')}
                </div>

                <RequesterImportStatusFilter
                    value={status}
                    values={results.map((row) => row.status)}
                    labels={Object.fromEntries(
                        Object.keys(syncResultLabelTypes).map((key) => [
                            key,
                            translate(`requester_imports.results.${key}`),
                        ]),
                    )}
                    onChange={(value) => {
                        setStatus(value);
                        filterUpdate({ page: 1 });
                    }}
                />
            </div>

            {notice}

            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    <div className="label-group">
                        {Object.entries(syncResultLabelTypes).map(([status, type]) => (
                            <Label key={status} type={type}>
                                {translate(`requester_imports.results.${status}`)}:{' '}
                                {results.filter((result) => result.status === status).length}
                            </Label>
                        ))}
                    </div>

                    {skipUnchanged && <div className="card-text">{translate('requester_imports.skipped_summary')}</div>}

                    {results.some(({ status }) => status === 'failed') && (
                        <InfoBox iconType="warning" iconColor="warning">
                            <p>{translate('requester_imports.sync_page.partial_description')}</p>
                        </InfoBox>
                    )}
                </div>
            </div>

            <LoaderTableCard
                columns={syncResultColumns}
                empty={filteredRows.length === 0}
                emptyTitle={translate(
                    results.length ? 'requester_imports.status_filter.empty' : 'requester_imports.sync.empty',
                )}>
                {filteredRows.slice(meta.from - 1, meta.to).map((result) => (
                    <Fragment key={result.id}>
                        <tr className="tr-clickable tr-narrow" onClick={() => toggleRow(result.id)}>
                            <td className="td-grow">
                                <TableEntityMain
                                    title={result.bsn}
                                    collapsed={!expandedRows.includes(result.id)}
                                    collapsedClicked={(event) => {
                                        event.stopPropagation();
                                        toggleRow(result.id);
                                    }}
                                />
                            </td>
                            <td>
                                {result.status === 'failed' ? (
                                    <TableEmptyValue />
                                ) : result.status === 'skipped' ? (
                                    result.profile_id === null ? (
                                        <TableEmptyValue />
                                    ) : (
                                        translate('requester_imports.sync_page.profile', { id: result.profile_id })
                                    )
                                ) : (
                                    <StateNavLink
                                        name={DashboardRoutes.IDENTITY}
                                        params={{ organizationId, id: result.identity_id }}
                                        className="text-primary text-semibold"
                                        onClick={(event) => event.stopPropagation()}>
                                        {translate('requester_imports.sync_page.profile', { id: result.profile_id })}
                                    </StateNavLink>
                                )}
                            </td>
                            <td>
                                {result.status === 'failed' || result.status === 'skipped' ? (
                                    <TableEmptyValue />
                                ) : (
                                    result.records_updated
                                )}
                            </td>
                            <td colSpan={2} className="table-td-actions text-right">
                                <Label type={syncResultLabelTypes[result.status]}>
                                    {translate(`requester_imports.results.${result.status}`)}
                                </Label>
                            </td>
                        </tr>

                        {expandedRows.includes(result.id) && (
                            <tr className="tr-gray tr-narrow">
                                <td colSpan={syncResultColumns.length + 1} className="text-white-space-normal">
                                    {result.status === 'failed' ? (
                                        <RequesterImportSyncErrors
                                            errors={result.errors}
                                            diagnosticId={result.diagnostic_id}
                                        />
                                    ) : result.status === 'skipped' ? (
                                        <div>{translate('requester_imports.skipped_description')}</div>
                                    ) : (
                                        <div className="flex flex-vertical flex-gap-xs">
                                            <div>
                                                {result.status === 'updated' && result.records_updated === 0
                                                    ? translate('requester_imports.sync_page.details.linked')
                                                    : translate(`requester_imports.sync_page.details.${result.status}`)}
                                            </div>

                                            <div>
                                                {translate('requester_imports.sync_page.fields_processed', {
                                                    count: result.records_synced,
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </Fragment>
                ))}
            </LoaderTableCard>

            {filteredRows.length > 0 && (
                <div className="card-section">
                    <Paginator
                        meta={meta}
                        filters={filterValues}
                        updateFilters={filterUpdate}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}

            <div className="card-footer card-footer-primary">{footer}</div>
        </div>
    );
}
