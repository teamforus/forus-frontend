import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useLatestRequestWithProgress from '../../../../../hooks/useLatestRequestWithProgress';
import usePushApiError from '../../../../../hooks/usePushApiError';
import useFilterNext from '../../../../../modules/filter_next/useFilterNext';
import usePaginatorService from '../../../../../modules/paginator/services/usePaginatorService';
import { PaginationData, ResponseError } from '../../../../../props/ApiResponses';
import IdentityProviderEvent, {
    IdentityProviderEventCategory,
} from '../../../../../props/models/IdentityProvider/IdentityProviderEvent';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import Label from '../../../../elements/label/Label';
import LoaderTableCard from '../../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import SelectControl from '../../../../elements/select-control/SelectControl';
import TableRowActions from '../../../../elements/tables/TableRowActions';
import useOpenModal from '../../../../../hooks/useOpenModal';
import EntraEventDetailsModal from '../modals/EntraEventDetailsModal';
import { outcomeLabels, outcomeTypes } from '../../constants';

export default function EntraEventsCard({
    organizationId,
    connectionUid,
    refreshKey,
    category,
}: {
    organizationId: number;
    connectionUid: string;
    refreshKey: number;
    category: IdentityProviderEventCategory;
}) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const openModal = useOpenModal();

    const paginatorService = usePaginatorService();
    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const [paginatorKey] = useState(
        category === 'sso' ? 'identity_provider_events_sso' : 'identity_provider_events_requester_provisioning',
    );
    const [events, setEvents] = useState<PaginationData<IdentityProviderEvent>>(null);

    const runLatestRequest = useLatestRequestWithProgress();

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey),
        outcome: null as 'success' | 'failure' | null,
    });

    const provisioning = category === 'requester_provisioning';

    const outcomeOptions = useMemo(
        () => [
            { value: null, name: translate('organizations_identity_provider_entra.events.all_outcomes') },
            { value: 'success', name: translate('organizations_identity_provider_entra.ui.successful') },
            { value: 'failure', name: translate('organizations_identity_provider_entra.ui.failed') },
        ],
        [translate],
    );

    const showEvent = useCallback(
        (event: IdentityProviderEvent) => openModal((modal) => <EntraEventDetailsModal modal={modal} event={event} />),
        [openModal],
    );

    const fetchEvents = useCallback(() => {
        runLatestRequest(
            (config) =>
                identityProviderConnectionService.events(
                    organizationId,
                    connectionUid,
                    { ...filterValuesActive, category },
                    config,
                ),
            {
                onSuccess: (response) => setEvents(response.data),
                onError: (error) => pushApiError(error as ResponseError),
            },
        );
    }, [
        category,
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
                <div className="card-title flex flex-grow">
                    {provisioning
                        ? translate('organizations_identity_provider_entra.events.provisioning_title')
                        : translate('organizations_identity_provider_entra.ui.events_title')}
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <div className="form">
                            <div className="form-group">
                                <SelectControl
                                    className="select-control-card-header"
                                    menuClassName="select-control-menu-card-header"
                                    propKey="value"
                                    options={outcomeOptions}
                                    value={filterValues.outcome}
                                    allowSearch={false}
                                    placeholder={translate('organizations_identity_provider_entra.events.all_outcomes')}
                                    onChange={(outcome: 'success' | 'failure' | null) =>
                                        filterUpdate({ outcome, page: 1 })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!events}
                empty={events?.meta.total === 0}
                emptyTitle={translate('organizations_identity_provider_entra.ui.events_empty')}
                columns={identityProviderConnectionService.getEventsColumns(category)}
                tableOptions={{ hasTooltips: false }}
                paginator={{ key: paginatorKey, data: events, filterValues, filterUpdate }}>
                {events?.data.map((event) => (
                    <tr
                        key={event.id}
                        className="tr-clickable tr-narrow"
                        tabIndex={0}
                        onClick={() => showEvent(event)}
                        onKeyDown={(e) => {
                            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                showEvent(event);
                            }
                        }}>
                        <td>{event.created_at_locale}</td>
                        <td>{event.event_type_locale}</td>
                        {provisioning && <td>{event.account || <TableEmptyValue />}</td>}
                        <td>
                            <Label type={outcomeTypes[event.outcome] || 'default'}>
                                {outcomeLabels[event.outcome] ? translate(outcomeLabels[event.outcome]) : event.outcome}
                            </Label>
                        </td>
                        <td>{event.error_code_locale || <TableEmptyValue />}</td>
                        <td className="table-td-actions text-right">
                            <TableRowActions
                                content={({ close }) => (
                                    <div className="dropdown dropdown-actions">
                                        <a
                                            href="#"
                                            className="dropdown-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                close();
                                                showEvent(event);
                                            }}>
                                            <em className="mdi mdi-eye icon-start" aria-hidden="true" />
                                            {translate('organizations_identity_provider_entra.ui.view_details')}
                                        </a>
                                    </div>
                                )}
                            />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
