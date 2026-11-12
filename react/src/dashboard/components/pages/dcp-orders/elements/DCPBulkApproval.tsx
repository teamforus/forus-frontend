import React, { useCallback, useEffect, useRef, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { useDCPService } from '../../../../services/DCPService';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import { ResponseError } from '../../../../props/ApiResponses';

export default function DCPBulkApproval({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();

    const [count, setCount] = useState(0);
    const [approving, setApproving] = useState(false);

    const approvingRef = useRef(false);

    const approve = useCallback(() => {
        if (approvingRef.current) {
            return;
        }

        approvingRef.current = true;
        setApproving(true);

        service
            .approve(organizationId)
            .then(
                (response) =>
                    navigateState(DashboardRoutes.DCP_ORDER_BULK, { organizationId, id: response.data.data.id }),
                (error: ResponseError) =>
                    pushApiError({
                        ...error,
                        data: {
                            ...error.data,
                            message: error.data?.errors?.orders?.[0] || error.data?.message,
                        },
                    }),
            )
            .finally(() => {
                approvingRef.current = false;
                setApproving(false);
            });
    }, [navigateState, organizationId, pushApiError, service]);

    const confirm = useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={translate('dcp.approval.title')}
                description_text={translate('dcp.approval.confirm', { count })}
                buttonCancel={{ text: translate('dcp.cancel'), onClick: modal.close }}
                buttonSubmit={{
                    text: translate('dcp.approval.button'),
                    onClick: () => {
                        modal.close();
                        approve();
                    },
                }}
            />
        ));
    }, [approve, count, openModal, translate]);

    useEffect(() => {
        runLatestRequest((config) => service.readyCount(organizationId, config), {
            onSuccess: (response) => setCount(response.data.data.count),
            onError: pushApiError,
        });
    }, [organizationId, pushApiError, runLatestRequest, service]);

    if (count === 0) {
        return null;
    }

    return (
        <div className="card-section">
            <div className="flex flex-vertical">
                <div className="card-text">{translate('dcp.approval.description', { count })}</div>

                <button className="button button-primary" disabled={approving} onClick={confirm}>
                    {approving ? (
                        <em className="mdi mdi-loading mdi-spin icon-start" />
                    ) : (
                        <em className="mdi mdi-cube-send icon-start" />
                    )}
                    {translate('dcp.approval.button')}
                </button>
            </div>
        </div>
    );
}
