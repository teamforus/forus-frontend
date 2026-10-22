import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mainContext } from '../../contexts/MainContext';
import { strLimit } from '../../helpers/string';

import { Announcements } from '../../components/elements/announcements/Accouncements';
import { useOrganizationService } from '../../services/OrganizationService';
import SelectControl from '../../components/elements/select-control/SelectControl';
import { getStateRouteUrl, useStateRoutes } from '../../modules/state_router/Router';
import { useNavigate } from 'react-router';
import HeaderNotifications from './blocks/HeaderNotifications';
import SelectControlOptionsOrganization from '../../components/elements/select-control/templates/SelectControlOptionsOrganization';
import ModalAuthPincode from '../../components/modals/ModalAuthPincode';
import Organization from '../../props/models/Organization';
import { useAnnouncementService } from '../../services/AnnouncementService';
import Announcement from '../../props/models/Announcement';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import useAppConfigs from '../../hooks/useAppConfigs';
import useOpenModal from '../../hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';
import useThumbnailUrl from '../../hooks/useThumbnailUrl';
import useAuthIdentity2FAState from '../../hooks/useAuthIdentity2FAState';
import classNames from 'classnames';
import useFDTargetObserverRef from '../../modules/frame_director/hooks/useFDTargetObserverRef';
import HeaderDropdown from './blocks/HeaderDropdown';
import HeaderAccountPanel from './blocks/HeaderAccountPanel';

export const LayoutHeader = ({
    sidebarOpen = false,
    onSidebarToggle = null,
}: {
    sidebarOpen?: boolean;
    onSidebarToggle?: () => void;
}) => {
    const openModal = useOpenModal();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();
    const authIdentity2FAState = useAuthIdentity2FAState();
    const assetUrl = useAssetUrl();
    const thumbnailUrl = useThumbnailUrl();

    const { envData, organizations, activeOrganization } = useContext(mainContext);
    const { route } = useStateRoutes();
    const navigate = useNavigate();

    const organizationService = useOrganizationService();
    const announcementService = useAnnouncementService();

    const [showIdentityMenu, setShowIdentityMenu] = useState(false);
    const [organizationAnnouncements, setOrganizationAnnouncements] = useState<Array<Announcement>>(null);

    const [roles] = useState({
        sponsor: 'Sponsor',
        provider: 'Aanbieder',
        validator: 'Beoordelaar',
    });

    const headerRef = useRef<HTMLElement>(null);
    const accountRef = useRef<HTMLButtonElement>(null);

    const announcements = useMemo(() => {
        return [...(organizationAnnouncements || []), ...(appConfigs?.announcements || [])];
    }, [appConfigs?.announcements, organizationAnnouncements]);

    const openAuthPincodeModal = useCallback(
        (e: React.MouseEvent) => {
            e?.preventDefault();
            setShowIdentityMenu(false);
            openModal((modal) => {
                return <ModalAuthPincode modal={modal} />;
            });
        },
        [openModal],
    );

    const closeAccount = useCallback(() => {
        setShowIdentityMenu(false);
    }, []);

    const accountContent = useMemo(() => {
        if (!authIdentity || !appConfigs) {
            return null;
        }

        return (
            <HeaderAccountPanel
                identity={authIdentity?.email || authIdentity?.address}
                logo={activeOrganization?.logo?.sizes?.thumbnail || thumbnailUrl('organization')}
                role={roles[envData.client_type]}
                clientType={envData.client_type}
                hasOrganization={!!activeOrganization}
                showSecurity={!!(activeOrganization?.allow_2fa_restrictions || authIdentity2FAState?.required)}
                fronts={appConfigs.fronts}
                onAuthorize={openAuthPincodeModal}
                onClose={closeAccount}
            />
        );
    }, [
        activeOrganization,
        appConfigs,
        authIdentity,
        authIdentity2FAState?.required,
        closeAccount,
        envData.client_type,
        openAuthPincodeModal,
        roles,
        thumbnailUrl,
    ]);

    useFDTargetObserverRef({
        targetRef: accountRef,
        show: showIdentityMenu,
        contentContainer: HeaderDropdown,
        content: accountContent,
        close: closeAccount,
        position: 'bottom',
        align: 'end',
    });

    useEffect(() => {
        if (sidebarOpen || !authIdentity) {
            setShowIdentityMenu(false);
        }
    }, [authIdentity, sidebarOpen]);

    useEffect(() => {
        const header = headerRef.current;

        if (!header) {
            return;
        }

        const updateHeight = () => {
            document.documentElement.style.setProperty('--app-header-height', `${header.offsetHeight}px`);
        };

        const observer = new ResizeObserver(updateHeight);

        updateHeight();
        observer.observe(header);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!activeOrganization?.id) {
            return;
        }

        announcementService.list(activeOrganization.id).then((res) => {
            setOrganizationAnnouncements(res.data.data);
        });
    }, [activeOrganization?.id, announcementService]);

    return (
        <header className="app app-header" ref={headerRef}>
            {/* Announcements */}
            {announcements?.length > 0 && <Announcements announcements={announcements} />}

            <div className="app-header-row">
                {onSidebarToggle && (
                    <div className="app-header-row-item app-header-row-item-menu">
                        <button
                            type="button"
                            className={classNames('header-action', sidebarOpen && 'active')}
                            aria-label={sidebarOpen ? 'Menu sluiten' : 'Menu openen'}
                            aria-expanded={sidebarOpen}
                            data-dusk="headerSidebarToggle"
                            onClick={onSidebarToggle}>
                            <em className={classNames('mdi', sidebarOpen ? 'mdi-close' : 'mdi-menu')} />
                            <span className="header-action-label">{sidebarOpen ? 'Sluiten' : 'Menu'}</span>
                        </button>
                    </div>
                )}

                <div className="app-header-row-item app-header-row-item-grow">
                    {!activeOrganization && (
                        <a href="" className="header-logo">
                            <img alt="Logo" className="header-logo-img" src={assetUrl('/assets/img/logo.svg')} />
                        </a>
                    )}

                    {activeOrganization && (
                        <div className="header-organization-switcher form">
                            {organizations && (
                                <SelectControl
                                    value={activeOrganization}
                                    options={organizations}
                                    allowSearch={true}
                                    onChange={(value: Organization) => {
                                        organizationService.setActiveId(value.id);

                                        navigate(
                                            getStateRouteUrl(route.state.fallbackState || route.state.name, {
                                                ...route.params,
                                                organizationId: value.id,
                                            }),
                                        );
                                    }}
                                    optionsComponent={SelectControlOptionsOrganization}
                                />
                            )}
                        </div>
                    )}
                </div>

                {activeOrganization && (
                    <div className="app-header-row-item">
                        <HeaderNotifications
                            organization={activeOrganization}
                            sidebarOpen={sidebarOpen}
                            onSidebarToggle={onSidebarToggle}
                        />
                    </div>
                )}

                {authIdentity && (
                    <div className="app-header-row-item">
                        <div className="header-auth">
                            <button
                                ref={accountRef}
                                type="button"
                                aria-expanded={showIdentityMenu}
                                className={classNames('header-action header-action-auth', showIdentityMenu && 'active')}
                                data-dusk="userProfile"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowIdentityMenu(!showIdentityMenu);

                                    if (!showIdentityMenu && sidebarOpen) {
                                        onSidebarToggle?.();
                                    }
                                }}>
                                <span className="auth-user-details">
                                    <span className="auth-user-name" data-dusk="identityEmail">
                                        {strLimit(authIdentity.email || authIdentity.address, 32)}
                                    </span>
                                    <span className="auth-user-role">{roles[envData.client_type]}</span>
                                </span>

                                <img
                                    src={activeOrganization?.logo?.sizes?.thumbnail || thumbnailUrl('organization')}
                                    alt="Organization logo"
                                    className="auth-user-img"
                                />

                                <span className="header-action-label">{roles[envData.client_type]}</span>

                                <span className="auth-user-caret">
                                    <em
                                        className={classNames(
                                            'mdi',
                                            showIdentityMenu ? 'mdi-chevron-up' : 'mdi-chevron-down',
                                        )}
                                    />
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
