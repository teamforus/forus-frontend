import React, { useCallback, useContext, useEffect, useState } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useIdentityService } from '../../../services/IdentityService';
import { useNavigate, useParams } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { StringParam, useQueryParams } from 'use-query-params';
import { pushNotificationContext } from '../../../modules/push_notifications/context/PushNotificationsContext';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { useOrganizationService } from '../../../services/OrganizationService';

const targetHome = 'homeStart';
const targetNewSignup = 'newSignup';

export default function IdentityRestore({ confirmation = false }: { confirmation: boolean }) {
    const tokenParam = useParams().token;

    const [query] = useState(
        useQueryParams({
            token: StringParam,
            target: StringParam,
        })[0],
    );

    const { setToken } = useContext(authContext);
    const { pushDanger } = useContext(pushNotificationContext);
    const target = query.target;
    const token = confirmation ? tokenParam : query.token;
    const identityService = useIdentityService();
    const organizationService = useOrganizationService();
    const navigate = useNavigate();

    const handleAuthTarget = useCallback(
        (target: Array<string>) => {
            if (target[0] == targetHome) {
                navigate(getStateRouteUrl(DashboardRoutes.HOME, { confirmed: true }));
                return true;
            }

            if (target[0] == targetNewSignup) {
                navigate(
                    getStateRouteUrl(DashboardRoutes.SIGN_UP, {
                        organization_id: target[1] || undefined,
                        fund_id: target[2] || undefined,
                        tag: target[3] || undefined,
                    }),
                );
                return true;
            }

            return false;
        },
        [navigate],
    );

    const navigateToDefaultAuthTarget = useCallback(
        (accessToken: string) => {
            organizationService
                .list(
                    { per_page: 1 },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    },
                )
                .then(
                    (res) => {
                        navigate(
                            getStateRouteUrl(
                                res.data.data.length === 0 ? DashboardRoutes.SIGN_UP : DashboardRoutes.ORGANIZATIONS,
                            ),
                        );
                    },
                    () => navigate(getStateRouteUrl(DashboardRoutes.ORGANIZATIONS)),
                );
        },
        [navigate, organizationService],
    );

    const exchangeToken = useCallback(
        (token: string, target: string) => {
            const promise = confirmation
                ? identityService.exchangeConfirmationToken(token)
                : identityService.authorizeAuthEmailToken(token);

            promise.then(
                function (res) {
                    setToken(res.data.access_token);

                    if (typeof target == 'string' && target.length > 0) {
                        if (!handleAuthTarget(target.split('-'))) {
                            navigate(getStateRouteUrl(DashboardRoutes.ORGANIZATIONS));
                        }

                        return;
                    }

                    navigateToDefaultAuthTarget(res.data.access_token);
                },
                () => {
                    pushDanger(
                        'Helaas, het is niet gelukt om in te loggen. ',
                        'De link is reeds gebruikt of niet meer geldig, probeer het opnieuw met een andere link.',
                    );

                    navigate(getStateRouteUrl(DashboardRoutes.HOME));
                },
            );
        },
        [confirmation, identityService, setToken, handleAuthTarget, navigate, navigateToDefaultAuthTarget, pushDanger],
    );

    useEffect(() => {
        if (token) {
            exchangeToken(token, target);
        }
    }, [exchangeToken, token, target]);

    return <></>;
}
