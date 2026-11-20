import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { VoucherPassChange } from '../../../../props/models/VoucherPass';
import { VoucherPassCsv } from '../types';
import useVoucherPassPagination from '../hooks/useVoucherPassPagination';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';
import Paginator from '../../../../modules/paginator/components/Paginator';
import Label, { LabelType } from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import VoucherPassChangesTable from './VoucherPassChangesTable';

type OverviewRow = {
    index: number;
    status: string;
    id?: number | null;
    changes?: VoucherPassChange[];
    message?: string;
    code?: string | null;
    errors?: Record<string, string[]>;
    diagnostic_id?: string;
};

export default function VoucherPassOverviewCard({
    csv,
    rows,
    estimated = false,
    fileName,
    skipUnchanged = false,
    options,
    footer,
}: {
    csv: VoucherPassCsv;
    rows: OverviewRow[];
    estimated?: boolean;
    fileName: string;
    skipUnchanged?: boolean;
    options?: ReactNode;
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [expanded, setExpanded] = useState<number[]>([]);

    const filtered = useMemo(() => {
        return rows.filter((row) => status === 'all' || row.status === status);
    }, [rows, status]);

    const labelTypes: Record<string, LabelType> = estimated
        ? { create: 'success', update: 'primary', unchanged: 'default' }
        : {
              created: 'success',
              updated: 'primary',
              unchanged: 'default',
              failed: 'danger',
              unknown: 'warning',
              unsubmitted: 'default',
              skipped: 'default',
          };

    const paginatorKey = estimated ? 'voucher_pass_preview' : 'voucher_pass_results';
    const labelPrefix = estimated ? 'voucher_passes.preview_status' : 'voucher_passes.result_status';

    const tabs = [
        { value: 'all', label: `${translate('voucher_passes.upload.all_statuses')} (${rows.length})` },
        ...Object.keys(labelTypes).map((value) => ({
            value,
            label: `${translate(`${labelPrefix}.${value}`)} (${rows.filter((row) => row.status === value).length})`,
        })),
    ];

    const columns = [
        {
            key: 'row',
            label: 'voucher_passes.upload.row_number',
            tooltip: {
                key: 'row',
                title: 'voucher_passes.upload.row_number',
                description: 'voucher_passes.upload.row_description',
            },
        },
        {
            key: 'owner',
            label: 'voucher_passes.fields.owner_bsn',
            tooltip: {
                key: 'owner',
                title: 'voucher_passes.fields.owner_bsn',
                description: 'voucher_passes.tooltips.owner_bsn',
            },
        },
        {
            key: 'target',
            label: 'voucher_passes.fields.target_bsn',
            tooltip: {
                key: 'target',
                title: 'voucher_passes.fields.target_bsn',
                description: 'voucher_passes.tooltips.target_bsn',
            },
        },
        {
            key: 'status',
            label: 'voucher_passes.fields.state',
            tooltip: {
                key: 'status',
                title: 'voucher_passes.fields.state',
                description: estimated
                    ? 'voucher_passes.upload.preview_description'
                    : 'voucher_passes.upload.result_description',
            },
        },
    ];

    const { meta, filterValues, filterUpdate } = useVoucherPassPagination(filtered.length, paginatorKey);

    const toggle = (index: number) => {
        setExpanded((current) =>
            current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
        );
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate(estimated ? 'voucher_passes.upload.preview' : 'voucher_passes.upload.results')}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="flex form">
                            <div>
                                <BlockLabelTabs
                                    value={status}
                                    setValue={(value) => {
                                        setStatus(value);
                                        filterUpdate({ page: 1 });
                                    }}
                                    tabs={tabs}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    <div className="text-semibold">{fileName}</div>

                    {estimated && (
                        <InfoBox>
                            <p>{translate('voucher_passes.upload.estimate')}</p>
                        </InfoBox>
                    )}

                    <div className="label-group">
                        {Object.entries(labelTypes).map(([value, type]) => (
                            <Label key={value} type={type}>
                                {translate(`${labelPrefix}.${value}`)}:{' '}
                                {rows.filter((row) => row.status === value).length}
                            </Label>
                        ))}
                    </div>

                    {!estimated && skipUnchanged && (
                        <div className="card-text">{translate('voucher_passes.upload.skipped')}</div>
                    )}

                    {rows.some((row) => row.status === 'unknown') && (
                        <InfoBox iconType="warning" iconColor="warning">
                            <p>{translate('voucher_passes.upload.unknown')}</p>
                        </InfoBox>
                    )}

                    {rows.some((row) => row.status === 'unsubmitted') && (
                        <div className="card-text">{translate('voucher_passes.upload.unsubmitted')}</div>
                    )}
                </div>
            </div>

            <LoaderTableCard
                columns={columns}
                empty={!filtered.length}
                emptyTitle={translate('voucher_passes.upload.empty_status')}>
                {filtered.slice(meta.from - 1, meta.to).map((row) => (
                    <Fragment key={row.index}>
                        <tr className="tr-clickable tr-narrow" onClick={() => toggle(row.index)}>
                            <td className="td-grow">
                                <TableEntityMain
                                    title={translate('voucher_passes.upload.row', { row: csv.rowNumbers[row.index] })}
                                    subtitle={csv.rows[row.index].external_id}
                                    collapsed={!expanded.includes(row.index)}
                                    collapsedClicked={(event) => {
                                        event.stopPropagation();
                                        toggle(row.index);
                                    }}
                                />
                            </td>
                            <td>{csv.rows[row.index].owner_bsn}</td>
                            <td>{csv.rows[row.index].target_bsn}</td>
                            <td colSpan={2} className="table-td-actions text-right">
                                <Label type={labelTypes[row.status]}>{translate(`${labelPrefix}.${row.status}`)}</Label>
                            </td>
                        </tr>

                        {expanded.includes(row.index) && (
                            <tr className="tr-narrow">
                                <td colSpan={columns.length + 1} className="td-paddless">
                                    {(row.id ||
                                        row.message ||
                                        row.errors ||
                                        row.diagnostic_id ||
                                        !row.changes?.length) && (
                                        <div className="card-section">
                                            <div className="flex flex-vertical flex-gap">
                                                {row.id != null && (
                                                    <div>
                                                        {translate('voucher_passes.fields.id')}: {row.id}
                                                    </div>
                                                )}

                                                {row.status !== 'failed' && row.code && (
                                                    <div>
                                                        {translate('voucher_passes.fields.code')}: {row.code}
                                                    </div>
                                                )}

                                                {row.message && <div>{row.message}</div>}

                                                {row.status === 'failed' && row.code === 'batch_rejected' && (
                                                    <div>{translate('voucher_passes.errors.batch_rejected')}</div>
                                                )}

                                                {Object.entries(row.errors || {}).map(([key, messages]) => (
                                                    <div key={key}>
                                                        {csv.columnNames[key.split('.')[0]] || key}:{' '}
                                                        {messages.join(' ')}
                                                    </div>
                                                ))}

                                                {row.diagnostic_id && (
                                                    <div>
                                                        {translate('voucher_passes.upload.diagnostic', {
                                                            reference: row.diagnostic_id,
                                                        })}
                                                    </div>
                                                )}

                                                {row.status === 'unknown' ||
                                                row.status === 'unsubmitted' ||
                                                row.status === 'skipped' ? (
                                                    <div>{translate(`voucher_passes.upload.${row.status}`)}</div>
                                                ) : (
                                                    row.changes?.length === 0 && (
                                                        <div>{translate('voucher_passes.upload.no_changes')}</div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!!row.changes?.length && (
                                        <VoucherPassChangesTable
                                            changes={row.changes}
                                            columnNames={csv.columnNames}
                                            estimated={estimated}
                                        />
                                    )}
                                </td>
                            </tr>
                        )}
                    </Fragment>
                ))}
            </LoaderTableCard>

            {filtered.length > 0 && (
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
