import { useContext, useEffect, useRef, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { authContext } from '../../../contexts/AuthContext';
import { useAuthService } from '../../../services/AuthService';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import { useIdentityProviderAuthService } from '../../../../dashboard/services/IdentityProviderAuthService';
import { consumeIdentityProviderHandoff } from '../../../../dashboard/helpers/identityProviderHandoff';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import { useWalletService } from '../../../services/WalletService';

export default function AuthLink() {
    const [walletCallback] = useState(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.slice(hash.lastIndexOf('#') + 1));

        if (params.has('wallet_ticket')) {
            window.history.replaceState(
                window.history.state,
                '',
                window.location.href.slice(0, window.location.href.lastIndexOf('#')),
            );
        }

        return params;
    });

    const walletStarted = useRef(false);
    const walletService = useWalletService();

    const { setToken } = useContext(authContext);
    const { onAuthRedirect, handleAuthTarget } = useAuthService();
    const identityService = useIdentityService();
    const identityProviderAuthService = useIdentityProviderAuthService();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const navigateState = useNavigateState();

    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    const [callbackError] = useState(() => consumeIdentityProviderHandoff('entra_error'));
    const [exchangeToken] = useState(() => consumeIdentityProviderHandoff('entra_exchange'));
    const [sessionUid] = useState(() => consumeIdentityProviderHandoff('entra_session'));
    const [callbackErrorReference] = useState(() => consumeIdentityProviderHandoff('entra_error_ref'));

    useEffect(() => {
        if (walletCallback.has('wallet_ticket') && !query.token) {
            if (!walletStarted.current) {
                walletStarted.current = true;

                const fundId = sessionStorage.getItem(`wallet_${walletCallback.get('wallet_session')}_fund`);

                walletService
                    .complete(walletCallback.get('wallet_session'), walletCallback.get('wallet_ticket'))
                    .catch(() => {
                        if (fundId) {
                            return navigateState(
                                WebshopRoutes.FUND_ACTIVATE,
                                { id: fundId },
                                { wallet_error: 'session_expired' },
                                { replace: true },
                            );
                        }

                        navigateState(WebshopRoutes.ERROR, { errorCode: 'wallet_session_expired' });
                    });
            }

            return;
        }

        if (callbackError) {
            identityProviderAuthService.clearBrowserToken(sessionUid);

            const message = translate('auth.push.entra_failed.title');

            pushDanger(
                translate('push.error'),
                callbackErrorReference
                    ? translate('auth.push.message_with_reference', { message, reference: callbackErrorReference })
                    : message,
            );

            navigateState(WebshopRoutes.HOME);
            return;
        }

        if (!exchangeToken && !query.token) {
            pushDanger(translate('push.error'), translate('auth.push.link_used.title'));
            navigateState(WebshopRoutes.HOME);
            return;
        }

        const exchange = exchangeToken
            ? identityProviderAuthService.exchange(sessionUid, exchangeToken)
            : identityService.exchangeShortToken(query.token);

        exchange
            .then((res) => {
                setToken(res.data.access_token);

                if (!handleAuthTarget(query.target)) {
                    onAuthRedirect().then();
                }
            })
            .catch((error: ResponseError<{ diagnostic_id?: string }>) => {
                const message = translate(exchangeToken ? 'auth.push.entra_failed.title' : 'auth.push.link_used.title');

                pushDanger(
                    translate('push.error'),
                    exchangeToken && error.data?.diagnostic_id
                        ? translate('auth.push.message_with_reference', {
                              message,
                              reference: error.data.diagnostic_id,
                          })
                        : message,
                );

                navigateState(WebshopRoutes.HOME);
            });
    }, [
        walletCallback,
        walletService,
        callbackError,
        callbackErrorReference,
        exchangeToken,
        handleAuthTarget,
        identityService,
        identityProviderAuthService,
        navigateState,
        onAuthRedirect,
        pushDanger,
        query?.target,
        query?.token,
        translate,
        setToken,
        sessionUid,
    ]);

    return null;
}
