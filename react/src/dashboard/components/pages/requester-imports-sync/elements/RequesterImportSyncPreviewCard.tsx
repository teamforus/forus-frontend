import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { RequesterImportRecordType, RequesterImportSyncPreview } from '../../../../props/models/RequesterImportRow';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Label from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';
import RequesterImportSyncErrors from './RequesterImportSyncErrors';
import { syncChangeColumns, syncChangeLabelTypes, syncPreviewColumns, syncPreviewLabelTypes } from '../constants';

export default function RequesterImportSyncPreviewCard({
    updateAll,
    preview,
    recordTypes,
    footer,
    notice,
    options,
}: {
    updateAll: boolean;
    preview: RequesterImportSyncPreview[];
    recordTypes: RequesterImportRecordType[];
    footer: ReactNode;
    notice?: ReactNode;
    options: ReactNode;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [paginatorKey] = useState('requester_import_sync_preview');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const recordNames = useMemo(() => {
        return Object.fromEntries(recordTypes.map(({ key, name }) => [key, name]));
    }, [recordTypes]);

    const filteredRows = useMemo(() => {
        return preview.filter((row) => status === 'all' || row.action === status);
    }, [preview, status]);

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(filteredRows.length, paginatorKey);

    const toggleRow = (id: number) => {
        setExpandedRows((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('requester_imports.sync_page.preview.title')}
                </div>

                <RequesterImportStatusFilter
                    value={status}
                    values={preview.map((row) => row.action)}
                    labels={Object.fromEntries(
                        Object.keys(syncPreviewLabelTypes).map((key) => [
                            key,
                            translate(`requester_imports.sync_page.preview.results.${key}`),
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
                    <div className="text-semibold">
                        {updateAll
                            ? translate('requester_imports.sync.update_all')
                            : translate('requester_imports.sync_page.preview.changed_only')}
                    </div>

                    <InfoBox>
                        <p>{translate('requester_imports.sync_page.preview.estimate')}</p>
                    </InfoBox>

                    <div className="label-group">
                        {Object.entries(syncPreviewLabelTypes).map(([action, type]) => (
                            <Label key={action} type={type}>
                                {translate(`requester_imports.sync_page.preview.results.${action}`)}:{' '}
                                {preview.filter((row) => row.action === action).length}
                            </Label>
                        ))}
                    </div>

                    {preview.some(({ action }) => action === 'blocked') && (
                        <InfoBox iconType="warning" iconColor="warning">
                            <p>{translate('requester_imports.sync_page.preview.blocked_notice')}</p>
                        </InfoBox>
                    )}
                </div>
            </div>

            <LoaderTableCard
                columns={syncPreviewColumns}
                empty={filteredRows.length === 0}
                emptyTitle={translate(
                    preview.length ? 'requester_imports.status_filter.empty' : 'requester_imports.sync.empty',
                )}>
                {filteredRows.slice(meta.from - 1, meta.to).map((row) => (
                    <Fragment key={row.id}>
                        <tr className="tr-clickable tr-narrow" onClick={() => toggleRow(row.id)}>
                            <td className="td-grow">
                                <TableEntityMain
                                    title={row.bsn}
                                    collapsed={!expandedRows.includes(row.id)}
                                    collapsedClicked={(event) => {
                                        event.stopPropagation();
                                        toggleRow(row.id);
                                    }}
                                />
                            </td>
                            <td>
                                {row.profile_id !== null ? (
                                    translate('requester_imports.sync_page.profile', { id: row.profile_id })
                                ) : row.action === 'create' ? (
                                    translate('requester_imports.sync_page.preview.new_profile')
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                            <td colSpan={2} className="table-td-actions text-right">
                                <Label type={syncPreviewLabelTypes[row.action]}>
                                    {translate(`requester_imports.sync_page.preview.results.${row.action}`)}
                                </Label>
                            </td>
                        </tr>

                        {expandedRows.includes(row.id) && (
                            <tr className="tr-narrow">
                                <td colSpan={syncPreviewColumns.length + 1} className="td-paddless">
                                    {row.action === 'blocked' ? (
                                        <div className="card-section">
                                            <RequesterImportSyncErrors
                                                errors={row.errors}
                                                diagnosticId={row.diagnostic_id}
                                            />
                                        </div>
                                    ) : row.changes.length > 0 ? (
                                        <Fragment>
                                            {row.changes.some(({ action }) => action === 'confirm_source') && (
                                                <div className="card-section">
                                                    <div className="card-text">
                                                        {translate('requester_imports.sync_page.preview.source_notice')}
                                                    </div>
                                                </div>
                                            )}

                                            <LoaderTableCard
                                                columns={syncChangeColumns}
                                                tableOptions={{ hasTooltips: false }}>
                                                {row.changes.map((change) => {
                                                    const actionLabel = translate(
                                                        `requester_imports.sync_page.preview.actions.${change.action}`,
                                                    );

                                                    return (
                                                        <tr key={change.record_type_key} className="tr-gray tr-narrow">
                                                            <td>
                                                                {recordNames[change.record_type_key] ||
                                                                    change.record_type_key}
                                                            </td>
                                                            <td>{change.current_value || <TableEmptyValue />}</td>
                                                            <td>{change.value || <TableEmptyValue />}</td>
                                                            <td className="text-right">
                                                                <Label type={syncChangeLabelTypes[change.action]}>
                                                                    {actionLabel}
                                                                </Label>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </LoaderTableCard>
                                        </Fragment>
                                    ) : (
                                        <div className="card-section">
                                            <div className="card-text">
                                                {row.action === 'create'
                                                    ? translate('requester_imports.sync_page.preview.create_empty')
                                                    : row.action === 'update'
                                                      ? translate('requester_imports.sync_page.preview.link_existing')
                                                      : translate('requester_imports.sync_page.preview.no_changes')}
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

            {options && <div className="card-section card-section-compact">{options}</div>}

            <div className="card-footer card-footer-primary">{footer}</div>
        </div>
    );
}
