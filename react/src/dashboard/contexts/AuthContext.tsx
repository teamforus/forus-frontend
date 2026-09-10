import React, { useCallback, useState } from 'react';
import { createContext, useEffect } from 'react';
import Identity from '../props/models/Identity';
import Employee from '../props/models/Employee';
import { getStateRouteUrl, useStateRoutes } from '../modules/state_router/Router';
import { useNavigate } from 'react-router';
import events from '../helpers/events';
import { ResponseError } from '../props/ApiResponses';
import Identity2FAState from '../props/models/Identity2FAState';
import useSetProgress from '../hooks/useSetProgress';
import { DashboardRoutes } from '../modules/state_router/RouterBuilder';
import useAuthToken from '../hooks/useAuthToken';
import useIdentityState from '../hooks/useIdentityState';

interface AuthMemoProps {
    token?: string;
    signOut?: () => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    identityEmployee?: Employee;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    setIdentityEmployee?: React.Dispatch<Employee>;
    hasToken?: boolean;
    setToken?: (token: string) => void;
    updateIdentity?: () => Promise<{ identity: Identity; identity2FAState: Identity2FAState }>;
}

const authContext = createContext<AuthMemoProps>(null);
const { Provider } = authContext;

const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const { route } = useStateRoutes();
    const [token, setToken] = useAuthToken();
    const [identityEmployee, setIdentityEmployee] = useState<Employee>(null);
    const navigate = useNavigate();
    const setProgress = useSetProgress();

    const { identity, setIdentity, identity2FAState, setIdentity2FAState, fetchIdentity2FA, updateIdentity } =
        useIdentityState(token);

    const signOut = useCallback(() => {
        setToken(null);
        setIdentity(null);
        setIdentity2FAState(null);
        setIdentityEmployee(null);
    }, [setIdentity, setIdentity2FAState, setToken]);

    useEffect(() => {
        if (token && !identity) {
            updateIdentity().then();
            return;
        }

        if (!token && route?.state?.protected) {
            navigate(getStateRouteUrl(DashboardRoutes.SIGN_IN));
            return;
        }
    }, [updateIdentity, token, navigate, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (data: CustomEvent<ResponseError<{ error?: string }>>) => {
            if (data.detail.status != 401) {
                return;
            }

            setProgress(100);

            if (data.detail.data.error === '2fa') {
                setIdentity(null);
                fetchIdentity2FA().then(() => navigate(getStateRouteUrl(DashboardRoutes.AUTH_2FA)));
                return;
            }

            return navigate(getStateRouteUrl(DashboardRoutes.SIGN_OUT));
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [fetchIdentity2FA, navigate, setIdentity, setProgress]);

    return (
        <Provider
            value={{
                token,
                setToken,
                hasToken: !!token,
                identity,
                identity2FAState,
                identityEmployee,
                setIdentity,
                setIdentityEmployee,
                setIdentity2FAState,
                updateIdentity,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
