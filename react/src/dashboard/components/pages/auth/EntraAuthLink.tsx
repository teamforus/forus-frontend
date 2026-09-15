import useTranslate from '../../../hooks/useTranslate';
import { useContext, useEffect, useState } from 'react';
import { useHref, useNavigate } from 'react-router';
import { authContext } from '../../../contexts/AuthContext';
import { useIdentityProviderAuthService } from '../../../services/IdentityProviderAuthService';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import usePushDanger from '../../../hooks/usePushDanger';
import { useOrganizationService } from '../../../services/OrganizationService';
import {
    appendIdentityProviderDiagnosticReference,
    consumeIdentityProviderHandoff,
} from '../../../helpers/identityProviderHandoff';
import { ResponseError } from '../../../props/ApiResponses';

export default function EntraAuthLink() {
    const translate = useTranslate();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const { setToken } = useContext(authContext);
    const organizationsHref = useHref(getStateRouteUrl(DashboardRoutes.ORGANIZATIONS));

    const organizationService = useOrganizationService();
    const identityProviderAuthService = useIdentityProviderAuthService();

    const [callbackError] = useState(() => consumeIdentityProviderHandoff('entra_error'));
    const [exchangeToken] = useState(() => consumeIdentityProviderHandoff('entra_exchange'));
    const [sessionUid] = useState(() => consumeIdentityProviderHandoff('entra_session'));
    const [callbackErrorReference] = useState(() => consumeIdentityProviderHandoff('entra_error_ref'));

    useEffect(() => {
        if (!exchangeToken || callbackError) {
            identityProviderAuthService.clearBrowserToken(sessionUid);

            pushDanger(
                translate('organizations_identity_provider_entra.ui.sign_in'),
                appendIdentityProviderDiagnosticReference(
                    translate('organizations_identity_provider_entra.ui.sign_in_failed'),
                    callbackErrorReference,
                ),
            );

            navigate(getStateRouteUrl(DashboardRoutes.SIGN_IN), { replace: true });
            return;
        }

        identityProviderAuthService
            .exchange(sessionUid, exchangeToken)
            .then((response) => {
                setToken(response.data.access_token);

                if (response.data.organization_id) {
                    organizationService.setActiveId(response.data.organization_id);
                }

                window.history.replaceState(window.history.state, document.title, organizationsHref);
                window.location.reload();
            })
            .catch((error: ResponseError<{ diagnostic_id?: string }>) => {
                pushDanger(
                    translate('organizations_identity_provider_entra.ui.sign_in'),
                    appendIdentityProviderDiagnosticReference(
                        translate('organizations_identity_provider_entra.ui.sign_in_failed'),
                        error.data?.diagnostic_id,
                    ),
                );

                navigate(getStateRouteUrl(DashboardRoutes.SIGN_IN), { replace: true });
            });
    }, [
        callbackError,
        callbackErrorReference,
        exchangeToken,
        identityProviderAuthService,
        navigate,
        organizationsHref,
        organizationService,
        pushDanger,
        setToken,
        translate,
        sessionUid,
    ]);

    return null;
}
