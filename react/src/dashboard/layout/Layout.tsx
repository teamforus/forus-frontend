import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutHeader } from './elements/LayoutHeader';
import { LayoutAside } from './elements/LayoutAside';
import { useStateRoutes } from '../modules/state_router/Router';
import Modals from '../modules/modals/components/Modals';
import PushNotifications from '../modules/push_notifications/components/PushNotifications';
import { modalsContext } from '../modules/modals/context/ModalContext';
import LoadingBar from '../modules/loading_bar/components/LoadingBar';
import { LayoutType } from '../modules/state_router/RouterProps';
import useAuthIdentity from '../hooks/useAuthIdentity';
import useActiveOrganization from '../hooks/useActiveOrganization';
import Toasts from '../modules/toasts/components/Toasts';
import { Libraries, LoadScript } from '@react-google-maps/api';
import useEnvData from '../hooks/useEnvData';
import Printable from '../modules/printable/components/Printable';
import ErrorBoundaryHandler from '../components/elements/error-boundary-handler/ErrorBoundaryHandler';
import classNames from 'classnames';
import { DashboardRoutes } from '../modules/state_router/RouterBuilder';

export const Layout = ({ children }: { children: React.ReactElement }) => {
    const { modals } = useContext(modalsContext);
    const { route } = useStateRoutes();
    const envData = useEnvData();

    const layout = route?.state?.layout;
    const authIdentity = useAuthIdentity();
    const activeOrganization = useActiveOrganization();
    const pageScrollRef = useRef<HTMLDivElement>(null);
    const containerScrollRef = useRef<HTMLDivElement>(null);

    const [libraries] = useState(['places'] as Libraries);
    const [showSidebar, setShowSidebar] = useState(false);
    const [animateSidebar, setAnimateSidebar] = useState(false);

    const isReady = useMemo(() => {
        return (
            !route.state?.protected ||
            (authIdentity && (activeOrganization || route.state?.name === DashboardRoutes.SECURITY_LINKED_ACCOUNTS))
        );
    }, [authIdentity, activeOrganization, route.state]);

    const hasSidebar = layout == LayoutType.dashboard && !!activeOrganization;

    const changeSidebar = useCallback(
        (open: boolean) => {
            if (open === showSidebar) {
                return;
            }

            setAnimateSidebar(window.matchMedia('(max-width: 1000px)').matches);
            setShowSidebar(open);
        },
        [showSidebar],
    );

    useEffect(() => {
        pageScrollRef?.current?.scrollTo({ top: 0 });
        containerScrollRef.current?.scrollTo({ top: 0 });
        setAnimateSidebar(false);
        setShowSidebar(false);
    }, [route?.pathname]);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 1000px)');
        const onBreakpointChange = () => setAnimateSidebar(false);

        media.addEventListener('change', onBreakpointChange);

        return () => {
            media.removeEventListener('change', onBreakpointChange);
        };
    }, []);

    useEffect(() => {
        if (!showSidebar) {
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && changeSidebar(false);

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [changeSidebar, showSidebar]);

    if (!envData?.config) {
        return null;
    }

    const content = (
        <ErrorBoundaryHandler type={'main'} front={'dashboard'}>
            <div
                className={classNames(
                    'app app-root',
                    modals.length > 0 && 'app-modals-shown',
                    showSidebar && 'app-sidebar-shown',
                    route?.state?.name == 'sign-in' && 'landing-root',
                    [LayoutType.landingClearNew].includes(layout) && 'signup-layout signup-layout-new',
                )}
                ref={pageScrollRef}>
                <LoadingBar />

                {[LayoutType.dashboard, LayoutType.landing].includes(layout) && (
                    <LayoutHeader
                        sidebarOpen={showSidebar}
                        onSidebarToggle={hasSidebar ? () => changeSidebar(!showSidebar) : null}
                    />
                )}

                <div className="app app-container" ref={containerScrollRef}>
                    {hasSidebar && (
                        <LayoutAside
                            open={showSidebar}
                            animating={animateSidebar}
                            onClose={() => changeSidebar(false)}
                            onAnimationEnd={() => setAnimateSidebar(false)}
                        />
                    )}

                    {isReady && (
                        <section className="app app-content">
                            <ErrorBoundaryHandler
                                type={
                                    [LayoutType.landingClearNew, LayoutType.landingClear].includes(layout)
                                        ? 'main'
                                        : 'block'
                                }
                                front={'dashboard'}>
                                {children}
                            </ErrorBoundaryHandler>
                        </section>
                    )}
                </div>

                <div className="app-overlays">
                    <Modals focusExclusions={'.frame-director'} />
                    <PushNotifications />
                    <Toasts />
                </div>
            </div>

            <Printable />
        </ErrorBoundaryHandler>
    );

    if ([DashboardRoutes.ENTRA_AUTH, DashboardRoutes.SECURITY_LINKED_ACCOUNTS].includes(route?.state?.name)) {
        return content;
    }

    return (
        <LoadScript
            googleMapsApiKey={envData?.config?.google_maps_api_key}
            libraries={libraries}
            loadingElement={<></>}>
            {content}
        </LoadScript>
    );
};
