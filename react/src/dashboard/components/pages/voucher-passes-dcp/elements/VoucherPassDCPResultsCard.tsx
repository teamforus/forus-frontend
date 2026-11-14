import React, { Fragment, ReactNode, useMemo, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import VoucherPassDCPResult, { VoucherPassDCPStatus } from '../../../../props/models/VoucherPassDCPResult';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Label, { LabelType } from '../../../elements/label/Label';
import InfoBox from '../../../elements/info-box/InfoBox';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';

const labelTypes: Record<VoucherPassDCPStatus, LabelType> = {
    would_create: 'success',
    would_update: 'primary',
    created: 'success',
    updated: 'primary',
    unchanged: 'default',
    skipped: 'default',
    blocked: 'danger',
    failed: 'danger',
};

export default function VoucherPassDCPResultsCard({
    organizationId,
    rows,
    preview,
    notice,
    footer,
}: {
    organizationId: number;
    rows: VoucherPassDCPResult[];
    preview: boolean;
    notice: ReactNode;
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const [status, setStatus] = useState('all');
    const [expanded, setExpanded] = useState<number[]>([]);
    const [paginatorKey] = useState(preview ? 'voucher_pass_dcp_preview' : 'voucher_pass_dcp_results');

    const filtered = useMemo(() => {
        return rows.filter((row) => status === 'all' || row.status === status);
    }, [rows, status]);

    const statuses: VoucherPassDCPStatus[] = preview
        ? ['would_create', 'would_update', 'unchanged', 'skipped', 'blocked']
        : ['created', 'updated', 'unchanged', 'skipped', 'failed'];

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(filtered.length, paginatorKey);

    const toggle = (id: number) => {
        setExpanded((ids) => (ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]));
    };

    return (
        <Card
            title={translate(preview ? 'dcp_prepare.preview_title' : 'dcp_prepare.results_title')}
            section={false}
            filters={
                <RequesterImportStatusFilter
                    value={status}
                    values={rows.map((row) => row.status)}
                    labels={Object.fromEntries(
                        statuses.map((value) => [value, translate(`dcp_prepare.statuses.${value}`)]),
                    )}
                    onChange={(value) => {
                        setStatus(value);
                        filterUpdate({ page: 1 });
                    }}
                />
            }
            footerType="primary"
            footer={footer}>
            {notice}

            {preview && (
                <div className="card-section">
                    <InfoBox>
                        <p>{translate('dcp_prepare.estimate')}</p>
                    </InfoBox>
                </div>
            )}

            <LoaderTableCard
                empty={filtered.length === 0}
                emptyTitle={translate('dcp_prepare.empty')}
                columns={['pass', 'order', 'status'].map((key) => ({
                    key,
                    label: `dcp_prepare.columns.${key}`,
                    tooltip: { key, title: `dcp_prepare.columns.${key}`, description: `dcp_prepare.tooltips.${key}` },
                }))}>
                {filtered.slice(meta.from - 1, meta.to).map((row) => (
                    <Fragment key={row.id}>
                        <tr className="tr-clickable tr-narrow" onClick={() => toggle(row.id)}>
                            <td className="td-grow">
                                <TableEntityMain
                                    title={translate('dcp_prepare.pass_title', { id: row.id })}
                                    subtitle={row.code}
                                    collapsed={!expanded.includes(row.id)}
                                    collapsedClicked={(event) => {
                                        event.stopPropagation();
                                        toggle(row.id);
                                    }}
                                />
                            </td>
                            <td>
                                {row.order_id ? (
                                    <StateNavLink
                                        name={DashboardRoutes.DCP_ORDER}
                                        params={{ organizationId, id: row.order_id }}>
                                        {`#${row.order_id}`}
                                    </StateNavLink>
                                ) : (
                                    <TableEmptyValue />
                                )}
                            </td>
                            <td colSpan={2} className="table-td-actions text-right">
                                <Label type={labelTypes[row.status]}>
                                    {translate(`dcp_prepare.statuses.${row.status}`)}
                                </Label>
                            </td>
                        </tr>

                        {expanded.includes(row.id) && (
                            <tr className="tr-narrow">
                                <td colSpan={4} className="td-paddless">
                                    <div className="card-section">
                                        <div className="card-text">{row.message}</div>

                                        {row.errors.length > 0 && (
                                            <div className="flex flex-vertical flex-gap-xs">
                                                {row.errors.map((error, index) => (
                                                    <div key={index}>{error}</div>
                                                ))}
                                            </div>
                                        )}

                                        {row.diagnostic_id && (
                                            <BlockInlineCopy className="flex-self-start" value={row.diagnostic_id}>
                                                {translate('requester_imports.diagnostic_reference', {
                                                    reference: row.diagnostic_id,
                                                })}
                                            </BlockInlineCopy>
                                        )}
                                    </div>

                                    {row.changes.length > 0 && (
                                        <LoaderTableCard
                                            tableOptions={{ hasTooltips: false }}
                                            columns={['field', 'previous', 'value', 'action'].map((key) => ({
                                                key,
                                                label: `dcp_prepare.columns.${key}`,
                                                headerClassName: key === 'action' ? 'text-right' : undefined,
                                            }))}>
                                            {row.changes.map((change) => (
                                                <tr key={change.field} className="tr-gray tr-narrow">
                                                    <td>{translate(`dcp_prepare.fields.${change.field}`)}</td>
                                                    <td>{change.previous_value || <TableEmptyValue />}</td>
                                                    <td>{change.value || <TableEmptyValue />}</td>
                                                    <td className="text-right">
                                                        <Label type={change.action === 'add' ? 'success' : 'primary'}>
                                                            {translate(
                                                                preview
                                                                    ? `dcp_prepare.actions.${change.action}`
                                                                    : `dcp_prepare.result_actions.${change.action}`,
                                                            )}
                                                        </Label>
                                                    </td>
                                                </tr>
                                            ))}
                                        </LoaderTableCard>
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
        </Card>
    );
}
