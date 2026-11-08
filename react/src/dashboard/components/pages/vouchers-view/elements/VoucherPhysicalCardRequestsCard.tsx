import React, { useCallback, useEffect, useState } from 'react';
import SponsorVoucher from '../../../../props/models/Sponsor/SponsorVoucher';
import Organization from '../../../../props/models/Organization';
import { PaginationData } from '../../../../props/ApiResponses';
import PhysicalCardRequest from '../../../../props/models/PhysicalCardRequest';
import { usePhysicalCardsRequestService } from '../../../../services/PhysicalCardsRequestService';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import DCPOrderState from '../../dcp-orders/elements/DCPOrderState';

export default function VoucherPhysicalCardRequestsCard({
    voucher,
    organization,
}: {
    voucher: SponsorVoucher;
    organization: Organization;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const paginatorService = usePaginatorService();
    const physicalCardsRequestService = usePhysicalCardsRequestService();

    const [paginatorKey] = useState('voucher-physical-card-requests');
    const [cardRequests, setCardRequests] = useState<PaginationData<PhysicalCardRequest>>(null);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        page?: number;
        per_page?: number;
    }>({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchCardRequests = useCallback(() => {
        runLatestRequest(
            (config) => physicalCardsRequestService.list(organization.id, voucher.address, filterValuesActive, config),
            {
                onSuccess: (res) => setCardRequests(res.data),
                onError: pushApiError,
            },
        );
    }, [filterValuesActive, organization.id, physicalCardsRequestService, pushApiError, runLatestRequest, voucher]);

    useEffect(() => {
        fetchCardRequests();
    }, [fetchCardRequests]);

    if (!cardRequests) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex flex-grow card-title">
                    {translate('voucher_physical_card_requests.header.title')}
                    {cardRequests?.meta ? ` (${cardRequests?.meta?.total})` : ''}
                </div>
            </div>

            <LoaderTableCard
                empty={cardRequests?.meta?.total == 0}
                emptyTitle={translate('voucher_physical_card_requests.empty.title')}
                emptyDescription={translate('voucher_physical_card_requests.empty.description')}
                columns={physicalCardsRequestService.getColumns(organization.has_dcp)}
                tableOptions={{ filter }}
                paginator={{ key: paginatorKey, data: cardRequests, filterValues, filterUpdate }}>
                {cardRequests?.data?.map((cardRequest) => (
                    <tr key={cardRequest.id}>
                        <td className="td-narrow nowrap">{cardRequest.id}</td>
                        <td>
                            {[cardRequest.first_name, cardRequest.last_name].filter((value) => value).join(' ') || (
                                <TableEmptyValue />
                            )}
                        </td>
                        <td>
                            <div>
                                {[cardRequest.address, cardRequest.house, cardRequest.house_addition]
                                    .filter((value) => value)
                                    .join(' ')}
                            </div>
                            <div className="text-muted">
                                {[cardRequest.postcode, cardRequest.city].filter((value) => value).join(' ')}
                            </div>
                        </td>
                        <td>{cardRequest.physical_card_type?.name || <TableEmptyValue />}</td>
                        <td className="nowrap">{cardRequest.created_at_locale}</td>
                        {organization.has_dcp && <td>{cardRequest.dcp_order?.order_id_dcp || <TableEmptyValue />}</td>}
                        <td className="nowrap">{cardRequest.card_code || <TableEmptyValue />}</td>
                        {organization.has_dcp && (
                            <td>
                                {cardRequest.dcp_order ? (
                                    <DCPOrderState order={cardRequest.dcp_order} />
                                ) : (
                                    <span className="text-muted">{translate('dcp_orders.states.none')}</span>
                                )}
                            </td>
                        )}
                        {organization.has_dcp && (
                            <td className="nowrap">
                                {cardRequest.dcp_order?.shipped_at_locale || <TableEmptyValue />}
                            </td>
                        )}
                        <td className="td-narrow"></td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
