import React, { useCallback, useEffect, useState, createContext, useRef } from 'react';
import Identity from '../../dashboard/props/models/Identity';
import { useStateRoutes } from '../modules/state_router/Router';
import events from '../../dashboard/helpers/events';
import { ResponseError } from '../../dashboard/props/ApiResponses';
import Identity2FAState from '../../dashboard/props/models/Identity2FAState';
import useSetProgress from '../../dashboard/hooks/useSetProgress';
import { useIdentityService } from '../../dashboard/services/IdentityService';
import { useNavigateState } from '../modules/state_router/Router';
import useOpenModal from '../../dashboard/hooks/useOpenModal';
import ModalNotification from '../components/modals/ModalNotification';
import useAppConfigs from '../hooks/useAppConfigs';
import useTranslate from '../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../modules/state_router/RouterBuilder';
import useAuthToken from '../../dashboard/hooks/useAuthToken';
import useIdentityState from '../../dashboard/hooks/useIdentityState';

interface AuthMemoProps {
    token?: string;
    signOut?: (
        e?: React.MouseEvent,
        needConfirmation?: boolean,
        deleteToken?: boolean,
        redirect?: boolean | string | (() => void),
    ) => void;
    setIdentity?: React.Dispatch<Identity>;
    identity?: Identity;
    identity2FAState?: Identity2FAState;
    setIdentity2FAState?: React.Dispatch<Identity2FAState>;
    hasToken?: boolean;
    setToken?: (token: string) => void;
    updateIdentity?: () => Promise<{ identity: Identity; identity2FAState: Identity2FAState }>;
}

const authContext = createContext<AuthMemoProps>(null);
const { Provider } = authContext;

const AuthProvider = ({ children }: { children: React.ReactElement }) => {
    const appConfigs = useAppConfigs();
    const { route } = useStateRoutes();
    const translate = useTranslate();
    const [token, setToken] = useAuthToken();
    const identityService = useIdentityService();
    const setProgress = useSetProgress();
    const openModal = useOpenModal();
    const navigateState = useNavigateState();

    const last401ErrorThreshold = useState<number>(10000)[0];
    const last401ErrorTime = useRef<number | null>(null);

    const { identity, setIdentity, identity2FAState, setIdentity2FAState, fetchIdentity2FA, updateIdentity } =
        useIdentityState(token);

    const signOut = useCallback(
        (
            e: React.MouseEvent = null,
            needConfirmation = false,
            deleteToken = true,
            redirect: boolean | WebshopRoutes | (() => void) = WebshopRoutes.HOME,
        ) => {
            e?.preventDefault();
            e?.stopPropagation();

            if (needConfirmation) {
                return openModal((modal) => (
                    <ModalNotification
                        modal={modal}
                        type={'confirm'}
                        title={translate('modal_logout.title')}
                        header={translate(
                            appConfigs?.communication_type === 'formal'
                                ? 'modal_logout.description_formal'
                                : 'modal_logout.description_informal',
                        )}
                        mdiIconType={'primary'}
                        mdiIconClass={'help-circle-outline'}
                        onConfirm={() => signOut()}
                    />
                ));
            }

            if (deleteToken) {
                identityService.deleteToken().then();
            }

            setToken(null);
            setIdentity(null);
            setIdentity2FAState(null);

            if (redirect && typeof redirect == 'function') {
                redirect();
            }

            if (redirect && typeof redirect == 'string') {
                navigateState(redirect);
            }
        },
        [
            appConfigs?.communication_type,
            identityService,
            navigateState,
            openModal,
            setIdentity,
            setIdentity2FAState,
            setToken,
            translate,
        ],
    );

    useEffect(() => {
        if (token && !identity) {
            updateIdentity().then();
            return;
        }

        if (!token && route?.state?.protected) {
            navigateState(WebshopRoutes.START);
            return;
        }
    }, [updateIdentity, token, navigateState, signOut, identity, route?.state?.name, route?.state?.protected]);

    useEffect(() => {
        const callback = (
            data: CustomEvent<{ reject: () => void } & ResponseError<{ error?: string; message?: string }>>,
        ) => {
            setProgress(100);

            if (data.detail.data.error === '2fa') {
                if (route?.state?.name !== WebshopRoutes.AUTH_2FA) {
                    setIdentity(null);
                    fetchIdentity2FA().then();
                    navigateState(WebshopRoutes.AUTH_2FA);
                }

                return;
            }

            if (!last401ErrorTime.current || Date.now() - last401ErrorTime.current > last401ErrorThreshold) {
                last401ErrorTime.current = Date.now();

                navigateState(WebshopRoutes.SIGN_OUT, null, null, {
                    state: { session_expired: data.detail.data.message == 'session_expired' },
                });
            }
        };

        events.subscribe('api-response:401', callback);

        return () => events.unsubscribe('api-response:401', callback);
    }, [
        fetchIdentity2FA,
        navigateState,
        route?.state?.name,
        setIdentity,
        setProgress,
        updateIdentity,
        last401ErrorThreshold,
    ]);

    return (
        <Provider
            value={{
                token,
                setToken,
                identity,
                identity2FAState,
                setIdentity,
                setIdentity2FAState,
                updateIdentity,
                hasToken: !!token,
                signOut,
            }}>
            {children}
        </Provider>
    );
};

export { AuthProvider, authContext };
