import { useContext, useEffect, useState } from 'react';
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

export default function AuthLink() {
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
