import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { RequesterImportPreviewOutcome, RequesterImportRecordType } from '../../../../props/models/RequesterImportRow';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Label from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';
import { RequesterImportCsv } from '../types';
import { changeColumns, changeLabelTypes, previewColumns, previewLabelTypes } from '../constants';

export default function RequesterImportPreviewCard({
    csv,
    fileName,
    preview,
    recordTypes,
    options,
    footer,
}: {
    csv: RequesterImportCsv;
    fileName: string;
    preview: RequesterImportPreviewOutcome[];
    recordTypes: RequesterImportRecordType[];
    options: ReactNode;
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [paginatorKey] = useState('requester_import_preview');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const recordNames = useMemo(() => {
        return { ...Object.fromEntries(recordTypes.map(({ key, name }) => [key, name])), ...csv.columnNames };
    }, [csv.columnNames, recordTypes]);

    const filteredRows = useMemo(() => {
        return preview.filter((row) => status === 'all' || row.action === status);
    }, [preview, status]);

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(filteredRows.length, paginatorKey);

    const toggleRow = (index: number) => {
        setExpandedRows((rows) => (rows.includes(index) ? rows.filter((row) => row !== index) : [...rows, index]));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{translate('requester_imports.upload.preview.title')}</div>

                <RequesterImportStatusFilter
                    value={status}
                    values={preview.map((row) => row.action)}
                    labels={Object.fromEntries(
                        Object.keys(previewLabelTypes).map((key) => [
                            key,
                            translate(`requester_imports.upload.preview.results.${key}`),
                        ]),
                    )}
                    onChange={(value) => {
                        setStatus(value);
                        filterUpdate({ page: 1 });
                    }}
                />
            </div>

            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    <div className="text-semibold">{fileName}</div>
                    <div className="card-text">{translate('requester_imports.upload.preview.description')}</div>

                    <InfoBox>
                        <p>{translate('requester_imports.upload.preview.estimate')}</p>
                    </InfoBox>

                    <div className="label-group">
                        {Object.entries(previewLabelTypes).map(([action, type]) => (
                            <Label key={action} type={type}>
                                {translate(`requester_imports.upload.preview.results.${action}`)}:{' '}
                                {preview.filter((row) => row.action === action).length}
                            </Label>
                        ))}
                    </div>
                </div>
            </div>

            <LoaderTableCard
                columns={previewColumns}
                empty={filteredRows.length === 0}
                emptyTitle={translate('requester_imports.status_filter.empty')}>
                {filteredRows.slice(meta.from - 1, meta.to).map((row) => (
                    <Fragment key={row.index}>
                        <tr className="tr-clickable tr-narrow" onClick={() => toggleRow(row.index)}>
                            <td className="td-grow">
                                <TableEntityMain
                                    title={translate('requester_imports.upload.preview.row', {
                                        row: csv.rowNumbers[row.index],
                                    })}
                                    subtitle={csv.rows[row.index].client_number}
                                    collapsed={!expandedRows.includes(row.index)}
                                    collapsedClicked={(event) => {
                                        event.stopPropagation();
                                        toggleRow(row.index);
                                    }}
                                />
                            </td>
                            <td>{csv.rows[row.index].bsn}</td>
                            <td colSpan={2} className="table-td-actions text-right">
                                <Label type={previewLabelTypes[row.action]}>
                                    {translate(`requester_imports.upload.preview.results.${row.action}`)}
                                </Label>
                            </td>
                        </tr>

                        {expandedRows.includes(row.index) && (
                            <tr className="tr-narrow">
                                <td colSpan={previewColumns.length + 1} className="td-paddless">
                                    {row.changes.length > 0 ? (
                                        <LoaderTableCard columns={changeColumns} tableOptions={{ hasTooltips: false }}>
                                            {row.changes.map((change) => {
                                                const actionLabel = translate(
                                                    `requester_imports.upload.preview.actions.${change.action}`,
                                                );

                                                return (
                                                    <tr key={change.record_type_key} className="tr-gray tr-narrow">
                                                        <td>
                                                            {recordNames[change.record_type_key] ||
                                                                change.record_type_key}
                                                        </td>
                                                        <td>{change.previous_value || <TableEmptyValue />}</td>
                                                        <td>{change.value || <TableEmptyValue />}</td>
                                                        <td className="text-right">
                                                            <Label type={changeLabelTypes[change.action]}>
                                                                {actionLabel}
                                                            </Label>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </LoaderTableCard>
                                    ) : (
                                        <div className="card-section">
                                            <div className="card-text">
                                                {translate('requester_imports.upload.preview.no_changes')}
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
