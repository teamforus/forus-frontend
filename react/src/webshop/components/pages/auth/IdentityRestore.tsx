import React, { useCallback, useContext, useEffect, useState } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../modules/state_router/Router';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { useAuthService } from '../../../services/AuthService';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalIdentityProxyExpired from '../../modals/ModalIdentityProxyExpired';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function IdentityRestore({ confirmation = false }: { confirmation: boolean }) {
    const tokenParam = useParams().token;

    const [query] = useState(
        useQueryParams({
            token: StringParam,
            target: StringParam,
        })[0],
    );

    const { setToken } = useContext(authContext);

    const openModal = useOpenModal();
    const target = query.target;
    const token = confirmation ? tokenParam : query.token;
    const identityService = useIdentityService();
    const navigateState = useNavigateState();
    const { onAuthRedirect, handleAuthTarget } = useAuthService();

    const exchangeToken = useCallback(
        (token: string, target: string) => {
            const promise = confirmation
                ? identityService.exchangeConfirmationToken(token)
                : identityService.authorizeAuthEmailToken(token);

            promise
                .then((res) => {
                    setToken(res.data.access_token);

                    if (!handleAuthTarget(target)) {
                        onAuthRedirect().then();
                    }
                })
                .catch(() => {
                    navigateState(WebshopRoutes.HOME);
                    openModal((modal) => <ModalIdentityProxyExpired modal={modal} />);
                });
        },
        [confirmation, identityService, setToken, handleAuthTarget, onAuthRedirect, navigateState, openModal],
    );

    useEffect(() => {
        if (token) {
            exchangeToken(token, target);
        }
    }, [exchangeToken, token, target]);

    return <></>;
}
