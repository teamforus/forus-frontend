import React, { useEffect, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import { useDCPService } from '../../../../services/DCPService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { PaginationData } from '../../../../props/ApiResponses';
import DCPEventLog from '../../../../props/models/DCPEventLog';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';

export default function DCPHistoryCard({
    organizationId,
    type,
    id,
}: {
    organizationId: number;
    type: 'order' | 'bulk';
    id: number;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();
    const paginatorService = usePaginatorService();

    const [loading, setLoading] = useState(true);
    const [paginatorKey] = useState('dcp_history');
    const [rows, setRows] = useState<PaginationData<DCPEventLog>>(null);

    const [filterValues, activeFilters, filterUpdate] = useFilterNext({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    useEffect(() => {
        runLatestRequest((config) => service.logs(organizationId, type, id, activeFilters, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setRows(response.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [activeFilters, id, organizationId, pushApiError, runLatestRequest, service, type]);

    return (
        <Card title={translate('dcp.history')} section={false}>
            <LoaderTableCard
                loading={loading}
                empty={!rows?.data.length}
                emptyTitle={translate('dcp.empty_history')}
                columns={['created_at', 'event', 'employee', 'diagnostic_id'].map((key) => ({
                    key,
                    label: `dcp.fields.${key}`,
                    tooltip: { key, title: `dcp.fields.${key}`, description: `dcp.tooltips.${key}` },
                }))}
                paginator={{ key: paginatorKey, data: rows, filterValues, filterUpdate }}>
                {rows?.data.map((log) => (
                    <tr key={log.id}>
                        <td>{log.created_at_locale}</td>
                        <td>{log.event_locale}</td>
                        <td>{log.identity_email || <TableEmptyValue />}</td>
                        <td>
                            {log.diagnostic_id ? (
                                <BlockInlineCopy value={log.diagnostic_id}>{log.diagnostic_id}</BlockInlineCopy>
                            ) : (
                                <TableEmptyValue />
                            )}
                        </td>
                        <td className="table-td-actions text-right">
                            <TableEmptyValue />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </Card>
    );
}
