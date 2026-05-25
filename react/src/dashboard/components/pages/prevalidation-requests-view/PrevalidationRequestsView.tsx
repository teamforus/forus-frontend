import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import PrevalidationRequest, { PrevalidationRequestRecordGroup } from '../../../props/models/PrevalidationRequest';
import { useParams } from 'react-router';
import { usePrevalidationRequestService } from '../../../services/PrevalidationRequestService';
import usePushApiError from '../../../hooks/usePushApiError';
import PrevalidationRequestOverview from './elements/PrevalidationRequestOverviewPane';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import PrevalidationRequestStateLabels from '../../elements/resource-states/PrevalidationRequestStateLabels';
import ModalPrevalidationRequestApproveMissedRecords from '../../modals/approve-missed-records/ModalPrevalidationRequestApproveMissedRecords';
import useOpenModal from '../../../hooks/useOpenModal';
import useTranslate from '../../../hooks/useTranslate';
import useRequestMissedRecords from '../../../hooks/useRequestMissedRecords';
import usePushDanger from '../../../hooks/usePushDanger';
import PrevalidationRequestRecord from '../../../props/models/PrevalidationRequestRecord';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import PrevalidationRequestRecordGroupRow from './elements/PrevalidationRequestGroupRow';
import BlockCardNotes from '../../elements/block-card-notes/BlockCardNotes';
import { RequestConfig } from '../../../props/ApiResponses';
import Note from '../../../props/models/Note';
import PrevalidationRequestBrpPersonCard from './elements/PrevalidationRequestBrpPersonCard';

export type PrevalidationRequestRecordLocal = PrevalidationRequestRecord & { hasContent: boolean; group_id?: number };

export type PrevalidationRequestRecordGroupLocal = PrevalidationRequestRecordGroup & {
    records?: Array<PrevalidationRequestRecordLocal>;
    hasContent?: boolean;
};

export type PrevalidationRequestLocal = PrevalidationRequest & {
    record_groups: Array<PrevalidationRequestRecordGroupLocal>;
};

export default function PrevalidationRequestsView() {
    const { id } = useParams();

    const activeOrganization = useActiveOrganization();

    const translate = useTranslate();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const pushDanger = usePushDanger();

    const prevalidationRequestService = usePrevalidationRequestService();

    const [request, setRequest] = useState<PrevalidationRequestLocal>(null);
    const [uncollapsedRecords, setUncollapsedRecords] = useState<Array<number>>([]);
    const [uncollapsedRecordGroups, setUncollapsedRecordGroups] = useState<Array<number>>([]);

    const { hasWarningMissedRecords, hasInfoMissedRecords } = useRequestMissedRecords(request);

    const hasCollapsedRecordGroups = useMemo(() => {
        return request?.record_groups.some((group) => !uncollapsedRecordGroups.includes(group.id));
    }, [request?.record_groups, uncollapsedRecordGroups]);

    const hasCollapsedRecords = useMemo(() => {
        return request?.records.some((record) => !uncollapsedRecords.includes(record.id));
    }, [request?.records, uncollapsedRecords]);

    const hasCollapsedGroupsOrRecords = useMemo(
        () => hasCollapsedRecordGroups || hasCollapsedRecords,
        [hasCollapsedRecordGroups, hasCollapsedRecords],
    );

    const canApproveMissingRecords = useMemo(() => {
        return (
            request?.state === 'missing_records' &&
            (hasWarningMissedRecords || hasInfoMissedRecords) &&
            !request?.missing_records_approved
        );
    }, [hasInfoMissedRecords, hasWarningMissedRecords, request]);

    const canFinalizePrevalidationRequest = useMemo(() => {
        return request?.missing_records_approved && (request.state === 'missing_records' || request.state === 'fail');
    }, [request]);

    const updateNotesRef = useRef<() => void>(null);

    const mapRequest = useCallback((request: PrevalidationRequest): PrevalidationRequestLocal => {
        const records = request.records.map((record) => ({
            ...record,
            hasContent: record.history.length > 0,
            group_id: 0,
        }));

        const recordsById = new Map(records.map((record) => [record.id, record]));

        const recordGroups: Array<PrevalidationRequestRecordGroupLocal> = request.record_groups.map((group) => {
            const groupRecords = (group.record_ids || [])
                .map((recordId) => recordsById.get(recordId))
                .filter((record) => record);

            groupRecords.forEach((record) => {
                record.group_id = group.id;
            });

            return {
                ...group,
                records: groupRecords,
                hasContent: groupRecords.filter((record) => record.history?.length).length > 0,
            };
        });

        return {
            ...request,
            record_groups: sortBy(recordGroups, 'order'),
        };
    }, []);

    const updateRequest = useCallback(
        (request: PrevalidationRequest) => {
            const mappedRequest = mapRequest(request);

            setRequest(mappedRequest);
            updateNotesRef?.current?.();

            return mappedRequest;
        },
        [mapRequest],
    );

    const handleFinalizePrevalidationRequestResponse = useCallback(
        (request: PrevalidationRequest) => {
            const mappedRequest = updateRequest(request);

            if (mappedRequest.state === 'fail') {
                pushDanger(
                    translate('prevalidation_requests.notifications.create_failed.title'),
                    translate('prevalidation_requests.notifications.create_failed.description'),
                );
            }

            return mappedRequest;
        },
        [pushDanger, translate, updateRequest],
    );

    const fetchPrevalidationRequest = useCallback(
        (id: number) => {
            setProgress(0);

            prevalidationRequestService
                .read(activeOrganization.id, id)
                .then((res) => updateRequest(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [activeOrganization?.id, prevalidationRequestService, pushApiError, setProgress, updateRequest],
    );

    const requestFinalizePrevalidationRequest = useCallback(() => {
        setProgress(0);

        prevalidationRequestService
            .finalize(activeOrganization.id, request.id)
            .then((res) => handleFinalizePrevalidationRequestResponse(res.data.data))
            .catch(pushApiError)
            .finally(() => setProgress(100));
    }, [
        activeOrganization?.id,
        handleFinalizePrevalidationRequestResponse,
        prevalidationRequestService,
        pushApiError,
        request?.id,
        setProgress,
    ]);

    const requestApproveMissedRecords = useCallback(
        (data: { note: string }) => {
            setProgress(0);

            prevalidationRequestService
                .approveMissedRecords(activeOrganization.id, request.id, data)
                .then((res) => {
                    const approvedRequest = updateRequest(res.data.data);

                    return prevalidationRequestService.finalize(activeOrganization.id, approvedRequest.id);
                })
                .then((res) => handleFinalizePrevalidationRequestResponse(res.data.data))
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [
            activeOrganization?.id,
            handleFinalizePrevalidationRequestResponse,
            prevalidationRequestService,
            pushApiError,
            request?.id,
            setProgress,
            updateRequest,
        ],
    );

    const resolveMissingRecords = useCallback(() => {
        openModal((modal) => (
            <ModalPrevalidationRequestApproveMissedRecords
                modal={modal}
                onSubmit={(data) => requestApproveMissedRecords(data)}
            />
        ));
    }, [openModal, requestApproveMissedRecords]);

    const fetchNotes = useCallback(
        (query = {}, config: RequestConfig = {}) =>
            prevalidationRequestService.notes(activeOrganization.id, request.id, query, config),
        [activeOrganization?.id, request?.id, prevalidationRequestService],
    );

    const deleteNote = useCallback(
        (note: Note) => prevalidationRequestService.noteDestroy(activeOrganization.id, request.id, note.id),
        [activeOrganization?.id, request?.id, prevalidationRequestService],
    );

    const storeNote = useCallback(
        (data: object) => prevalidationRequestService.storeNote(activeOrganization.id, request.id, data),
        [activeOrganization?.id, request?.id, prevalidationRequestService],
    );

    useEffect(() => {
        fetchPrevalidationRequest(parseInt(id));
    }, [fetchPrevalidationRequest, id]);

    if (!request) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.PREVALIDATION_REQUESTS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('prevalidation_requests.header.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">{`#${request.id}`}</div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                        <span>{`#${request.id}`}</span>
                        <PrevalidationRequestStateLabels request={request} />
                    </div>

                    <div className="card-header-filters flex-self-start">
                        <div className="block block-inline-filters">
                            <div className="button-group">
                                {canApproveMissingRecords && (
                                    <button
                                        className="button button-primary"
                                        onClick={resolveMissingRecords}
                                        data-dusk="prevalidationRequestApproveMissedBtn">
                                        <em className="mdi mdi-check icon-start" />
                                        {translate('prevalidation_requests.buttons.approve_missing_records')}
                                    </button>
                                )}

                                {canFinalizePrevalidationRequest && (
                                    <button
                                        className="button button-primary"
                                        onClick={requestFinalizePrevalidationRequest}
                                        data-dusk="prevalidationRequestFinalizeBtn">
                                        <em
                                            className={classNames(
                                                'mdi',
                                                'icon-start',
                                                request.state === 'fail' ? 'mdi-refresh' : 'mdi-check',
                                            )}
                                        />
                                        {translate(
                                            `prevalidation_requests.buttons.${
                                                request.state === 'fail'
                                                    ? 'retry_create_prevalidation'
                                                    : 'create_prevalidation'
                                            }`,
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <PrevalidationRequestOverview request={request} />
            </div>

            <PrevalidationRequestBrpPersonCard organization={activeOrganization} request={request} />

            <div className="card">
                <div className="card-header">
                    <div className="flex flex-grow card-title">
                        {translate('validation_requests.labels.records')} ({request.records.length})
                    </div>

                    <div className="card-header-filters">
                        <div className="block block-inline-filters">
                            <button
                                data-dusk="toggleCollapseBtn"
                                className="button button-default button-sm"
                                onClick={() => {
                                    if (hasCollapsedGroupsOrRecords) {
                                        setUncollapsedRecordGroups(request.record_groups.map((group) => group.id));
                                        setUncollapsedRecords(request.records.map((record) => record.id));
                                        return;
                                    }

                                    setUncollapsedRecordGroups([]);
                                    setUncollapsedRecords([]);
                                }}>
                                <em
                                    className={classNames(
                                        'mdi',
                                        'icon-start',
                                        hasCollapsedGroupsOrRecords
                                            ? 'mdi-arrow-expand-vertical'
                                            : 'mdi-arrow-collapse-vertical',
                                    )}
                                />
                                {translate(
                                    `validation_requests.buttons.${
                                        hasCollapsedGroupsOrRecords ? 'uncollapse' : 'collapse'
                                    }`,
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <LoaderTableCard
                    empty={request.record_groups.length === 0}
                    emptyTitle={'Geen records'}
                    columns={prevalidationRequestService.getRecordGroupsColumns()}>
                    {request.record_groups.map((group: PrevalidationRequestRecordGroupLocal) => (
                        <PrevalidationRequestRecordGroupRow
                            key={group.id}
                            organization={activeOrganization}
                            group={group}
                            canEditRecord={request.state !== 'success'}
                            uncollapsedRecords={uncollapsedRecords}
                            setUncollapsedRecords={setUncollapsedRecords}
                            uncollapsedRecordGroups={uncollapsedRecordGroups}
                            setUncollapsedRecordGroups={setUncollapsedRecordGroups}
                            reloadRequest={() => fetchPrevalidationRequest(parseInt(id))}
                        />
                    ))}
                </LoaderTableCard>
            </div>

            <BlockCardNotes
                showCreate={true}
                fetchNotes={fetchNotes}
                deleteNote={deleteNote}
                storeNote={storeNote}
                fetchNotesRef={updateNotesRef}
            />
        </Fragment>
    );
}
