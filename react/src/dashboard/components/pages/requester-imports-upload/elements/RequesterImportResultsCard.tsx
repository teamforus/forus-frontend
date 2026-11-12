import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import Label from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import { RequesterImportCsv, RequesterImportUploadOutcome } from '../types';
import { resultColumns, resultLabelTypes } from '../constants';
import { RequesterImportRecordType } from '../../../../props/models/RequesterImportRow';
import Paginator from '../../../../modules/paginator/components/Paginator';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';
import RequesterImportResultDetails from './RequesterImportResultDetails';

export default function RequesterImportResultsCard({
    csv,
    results,
    recordTypes,
    skipUnchanged,
    footer,
}: {
    csv: RequesterImportCsv;
    results: RequesterImportUploadOutcome[];
    recordTypes: RequesterImportRecordType[];
    skipUnchanged: boolean;
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [paginatorKey] = useState('requester_import_results');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const recordNames = useMemo(() => {
        return { ...Object.fromEntries(recordTypes.map(({ key, name }) => [key, name])), ...csv.columnNames };
    }, [csv.columnNames, recordTypes]);

    const filteredRows = useMemo(() => {
        return results.filter((row) => status === 'all' || row.status === status);
    }, [results, status]);

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(filteredRows.length, paginatorKey);

    const toggleRow = (index: number) => {
        setExpandedRows((rows) => (rows.includes(index) ? rows.filter((row) => row !== index) : [...rows, index]));
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">{translate('requester_imports.upload.results.title')}</div>

                <RequesterImportStatusFilter
                    value={status}
                    values={results.map((row) => row.status)}
                    labels={Object.fromEntries(
                        Object.keys(resultLabelTypes).map((key) => [
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

            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    <div className="label-group">
                        {Object.entries(resultLabelTypes).map(([status, type]) => (
                            <Label key={status} type={type}>
                                {translate(`requester_imports.results.${status}`)}:{' '}
                                {results.filter((row) => row.status === status).length}
                            </Label>
                        ))}
                    </div>

                    {skipUnchanged && <div className="card-text">{translate('requester_imports.skipped_summary')}</div>}

                    {results.some(({ status }) => status === 'unknown') && (
                        <InfoBox iconType="warning" iconColor="warning">
                            <p>{translate('requester_imports.upload.results.unknown')}</p>
                        </InfoBox>
                    )}

                    {results.some(({ status }) => status === 'unsubmitted') && (
                        <div className="card-text">{translate('requester_imports.upload.results.unsubmitted')}</div>
                    )}
                </div>
            </div>

            <LoaderTableCard
                columns={resultColumns}
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
                                <Label type={resultLabelTypes[row.status]}>
                                    {translate(`requester_imports.results.${row.status}`)}
                                </Label>
                            </td>
                        </tr>

                        {expandedRows.includes(row.index) && (
                            <tr className="tr-narrow">
                                <td colSpan={resultColumns.length + 1} className="td-paddless">
                                    <RequesterImportResultDetails result={row} recordNames={recordNames} />
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
