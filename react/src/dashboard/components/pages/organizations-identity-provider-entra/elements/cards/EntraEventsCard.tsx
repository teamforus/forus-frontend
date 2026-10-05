import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useEffect, useState } from 'react';
import useLatestRequestWithProgress from '../../../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../../../hooks/usePushApiError';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData, ResponseError } from '../../../../../props/ApiResponses';
import type IdentityProviderEvent from '../../../../../props/models/IdentityProvider/IdentityProviderEvent';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import Label, { LabelType } from '../../../../elements/label/Label';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';

const outcomeLabels: Record<string, string> = {
    success: 'organizations_identity_provider_entra.ui.successful',
    failure: 'organizations_identity_provider_entra.ui.failed',
    conflict: 'organizations_identity_provider_entra.ui.conflict',
};

const outcomeTypes: Record<string, LabelType> = {
    success: 'success',
    failure: 'danger',
    conflict: 'warning',
};

export default function EntraEventsCard({
    organizationId,
    connectionUid,
    refreshKey,
}: {
    organizationId: number;
    connectionUid: string;
    refreshKey: number;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [paginatorKey] = useState('identity_provider_events');
    const [events, setEvents] = useState<PaginationData<IdentityProviderEvent>>(null);

    const runLatestRequest = useLatestRequestWithProgress();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchEvents = useCallback(() => {
        runLatestRequest(
            (config) =>
                identityProviderConnectionService.events(organizationId, connectionUid, filterValuesActive, config),
            {
                onSuccess: (response) => setEvents(response.data),
                onError: (error) => pushApiError(error as ResponseError),
            },
        );
    }, [
        connectionUid,
        filterValuesActive,
        identityProviderConnectionService,
        organizationId,
        pushApiError,
        runLatestRequest,
    ]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents, refreshKey]);

    return (
        <div className="card card-collapsed">
            <div className="card-header">
                <div className="card-title">{translate('organizations_identity_provider_entra.ui.events_title')}</div>
            </div>

            <LoaderTableCard
                loading={!events}
                empty={events?.meta.total === 0}
                emptyTitle={translate('organizations_identity_provider_entra.ui.events_empty')}
                columns={identityProviderConnectionService.getEventsColumns()}
                tableOptions={{ hasTooltips: false }}
                paginator={{ key: paginatorKey, data: events, filterValues, filterUpdate }}>
                {events?.data.map((event) => (
                    <tr key={event.id}>
                        <td>{event.created_at_locale}</td>
                        <td>{event.event_type_locale}</td>
                        <td>
                            <Label type={outcomeTypes[event.outcome] || 'default'}>
                                {outcomeLabels[event.outcome] ? translate(outcomeLabels[event.outcome]) : event.outcome}
                            </Label>
                        </td>
                        <td>{event.error_code_locale || <TableEmptyValue />}</td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
