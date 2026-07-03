import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import useTranslate from '../../../../hooks/useTranslate';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../props/ApiResponses';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableRowActions from '../../../elements/tables/TableRowActions';
import Organization from '../../../../props/models/Organization';
import Reservation from '../../../../props/models/Reservation';
import useProductReservationService from '../../../../services/ProductReservationService';
import ProviderMessage from '../../../../props/models/ProviderMessage';
import ModalAddProviderMessage from '../../../modals/ModalAddProviderMessage';
import { useFileService } from '../../../../services/FileService';
import useSetProgress from '../../../../hooks/useSetProgress';
import ModalProviderMessageShow from '../../../modals/ModalProviderMessageShow';
import { strLimit } from '../../../../helpers/string';

export default function BlockCardProviderMessages({
    organization,
    reservation,
    fetchProviderMessagesRef,
}: {
    organization: Organization;
    reservation: Reservation;
    fetchProviderMessagesRef?: React.RefObject<() => void>;
}) {
    const openModal = useOpenModal();
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();
    const setProgress = useSetProgress();

    const paginatorService = usePaginatorService();
    const fileService = useFileService();
    const productReservationService = useProductReservationService();

    const [messages, setMessages] = useState<PaginationData<ProviderMessage>>(null);
    const [paginatorKey] = useState('reservation_provider_messages');

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchProviderMessages = useCallback(() => {
        runLatestRequest(
            (config) =>
                productReservationService.providerMessages(organization.id, reservation.id, filterValuesActive, config),
            {
                onSuccess: (res) => setMessages(res.data),
                onError: pushApiError,
            },
        );
    }, [
        filterValuesActive,
        organization.id,
        productReservationService,
        pushApiError,
        reservation.id,
        runLatestRequest,
    ]);

    const storeMessage = useCallback(
        (data: object) => productReservationService.storeProviderMessage(organization.id, reservation.id, data),
        [organization.id, productReservationService, reservation.id],
    );

    const exportProviderMessage = useCallback(
        (providerMessage: ProviderMessage) => {
            productReservationService
                .exportProviderMessage(organization.id, reservation.id, providerMessage.id)
                .then((res) => fileService.downloadFile(`provider-message-${providerMessage.id}.pdf`, res.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));

            setProgress(0);
        },
        [fileService, organization.id, productReservationService, pushApiError, reservation.id, setProgress],
    );

    const openMessage = useCallback(
        (providerMessage: ProviderMessage) => {
            openModal((modal) => {
                return (
                    <ModalProviderMessageShow
                        modal={modal}
                        providerMessage={providerMessage}
                        exportProviderMessage={exportProviderMessage}
                    />
                );
            });
        },
        [openModal, exportProviderMessage],
    );

    const onAddProviderMessage = useCallback(() => {
        openModal((modal) => (
            <ModalAddProviderMessage
                modal={modal}
                storeMessage={storeMessage}
                onCreated={() => {
                    fetchProviderMessages();
                    pushSuccess('Gelukt!', 'Message created.');
                }}
            />
        ));
    }, [openModal, storeMessage, fetchProviderMessages, pushSuccess]);

    useEffect(() => {
        fetchProviderMessages();
    }, [fetchProviderMessages]);

    useEffect(() => {
        if (fetchProviderMessagesRef) {
            fetchProviderMessagesRef.current = fetchProviderMessages;
        }
    }, [fetchProviderMessagesRef, fetchProviderMessages]);

    if (!messages) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('provider_message.header.title')}({messages?.meta?.total})
                </div>
                <div className="button-group">
                    <div
                        className="button button-sm button-primary"
                        onClick={onAddProviderMessage}
                        data-dusk="addProviderMessageBtn">
                        <em className="mdi mdi-plus icon-start" />
                        {translate('provider_message.buttons.add_new')}
                    </div>
                </div>
            </div>

            <LoaderTableCard
                empty={!messages?.meta?.total}
                emptyTitle={translate('provider_message.empty.title')}
                emptyDescription={translate('provider_message.empty.description')}
                columns={productReservationService.getProviderMessagesColumns()}
                paginator={{ key: paginatorKey, data: messages, filterValues, filterUpdate }}>
                {messages?.data?.map((message) => (
                    <tr key={message.id} data-dusk={`providerMessageRow${message.id}`}>
                        <td>
                            <strong className="text-primary">{message.created_at_locale?.split(' - ')[0]}</strong>
                            <br />
                            <strong className="text-strong text-md text-muted-dark">
                                {message.created_at_locale?.split(' - ')[1]}
                            </strong>
                        </td>
                        <td>
                            <div className="text-semibold">{message.type_locale}</div>
                            <div className="text-md ellipsis">{strLimit(message.message.trim(), 64)}</div>
                        </td>
                        <td className="nowrap text-primary">{message.identity.email}</td>
                        <td className="nowrap text-primary">{message.employee?.email}</td>

                        <td className="td-narrow text-right">
                            <TableRowActions
                                dataDusk={`providerMessageMenuBtn${message.id}`}
                                content={(e) => (
                                    <div className="dropdown dropdown-actions">
                                        <a
                                            className={'dropdown-item'}
                                            data-dusk="openEmail"
                                            onClick={() => {
                                                openMessage(message);
                                                e.close();
                                            }}>
                                            <em className="mdi mdi-eye icon-start" />
                                            {translate('provider_message.buttons.view')}
                                        </a>
                                        <a
                                            className={'dropdown-item'}
                                            data-dusk="exportEmail"
                                            onClick={() => {
                                                exportProviderMessage(message);
                                                e.close();
                                            }}>
                                            <em className="mdi mdi-content-save-outline icon-start" />
                                            {translate('provider_message.buttons.download')}
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
