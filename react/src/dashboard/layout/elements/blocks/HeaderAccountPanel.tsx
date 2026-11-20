import React, { MouseEventHandler } from 'react';
import { NavLink } from 'react-router';
import classNames from 'classnames';
import useTranslate from '../../../hooks/useTranslate';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import IconEmail from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-email.svg';
import IconNotifications from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-notifications.svg';
import IconSecurity from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-security.svg';
import IconSessions from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sessions.svg';
import IconAuthorizeDevice from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-authorize-device.svg';
import IconSignOut from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sign-out.svg';

import IconValidator from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-validator.svg';
import IconProvider from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-provider.svg';
import IconSponsor from '../../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sponsor.svg';

interface IdentityMenuItemProps {
    onClose: () => void;
    url?: string;
    href?: string;
    name: string;
    icon: React.ReactElement;
    dusk?: string;
    active?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}

const IdentityMenuItem = ({ url, href, name, icon, dusk, active, onClick, onClose }: IdentityMenuItemProps) => {
    if (url) {
        return (
            <NavLink
                onClick={onClose}
                to={url}
                data-dusk={dusk}
                className={() => classNames('header-account-item', active && 'active')}>
                <div className="header-account-item-icon">{icon}</div>
                <span className="header-account-item-label">{name}</span>
            </NavLink>
        );
    }

    return (
        <a
            href={href}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            data-dusk={dusk}
            className={classNames('header-account-item', active && 'active')}
            onClick={(event) => {
                onClick?.(event);
                onClose();
            }}
            onKeyDown={(event) => {
                if (onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    event.currentTarget.click();
                }
            }}>
            <div className="header-account-item-icon">{icon}</div>
            <span className="header-account-item-label">{name}</span>
        </a>
    );
};

export default function HeaderAccountPanel({
    identity,
    logo,
    role,
    clientType,
    hasOrganization,
    canManageEmails,
    showLinkedAccounts,
    showSecurity,
    fronts,
    onAuthorize,
    onClose,
}: {
    identity: string;
    logo: string;
    role: string;
    clientType: string;
    hasOrganization: boolean;
    canManageEmails: boolean;
    showLinkedAccounts: boolean;
    showSecurity: boolean;
    fronts: { url_validator: string; url_sponsor: string; url_provider: string };
    onAuthorize: MouseEventHandler<HTMLElement>;
    onClose: () => void;
}) {
    const translate = useTranslate();

    return (
        <div className="block block-header-account">
            <div className="header-account-identity">
                <img src={logo} alt="" className="header-account-identity-img" />
                <div className="header-account-identity-details">
                    <div className="header-account-identity-role">{role}</div>
                    <div className="header-account-identity-name">{identity}</div>
                </div>
            </div>

            <div className="header-account-items">
                {hasOrganization && canManageEmails && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name={'E-mail instellingen'}
                        url={getStateRouteUrl(DashboardRoutes.PREFERENCE_EMAILS)}
                        dusk={'btnUserEmails'}
                        icon={<IconEmail />}
                    />
                )}

                {hasOrganization && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name={'Notificatievoorkeuren'}
                        url={getStateRouteUrl(DashboardRoutes.PREFERENCE_NOTIFICATIONS)}
                        icon={<IconNotifications />}
                    />
                )}

                {showSecurity && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name="Beveiliging"
                        url={getStateRouteUrl(DashboardRoutes.SECURITY_2FA)}
                        icon={<IconSecurity />}
                    />
                )}

                {showLinkedAccounts && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name={translate('organizations_identity_provider_entra.ui.linked_accounts')}
                        url={getStateRouteUrl(DashboardRoutes.SECURITY_LINKED_ACCOUNTS)}
                        icon={<IconSecurity />}
                    />
                )}

                {hasOrganization && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name="Sessies"
                        url={getStateRouteUrl(DashboardRoutes.SECURITY_SESSIONS)}
                        icon={<IconSessions />}
                    />
                )}

                {hasOrganization && <div className="header-account-sep" />}

                {hasOrganization && (
                    <IdentityMenuItem
                        onClose={onClose}
                        name="Autoriseer apparaat"
                        onClick={onAuthorize}
                        icon={<IconAuthorizeDevice />}
                    />
                )}

                {hasOrganization && <div className="header-account-sep" />}

                <div className="header-account-title">Kies je rol</div>

                <IdentityMenuItem
                    onClose={onClose}
                    name="Beoordelaar"
                    active={clientType == 'validator'}
                    href={fronts.url_validator}
                    icon={<IconValidator />}
                />

                <IdentityMenuItem
                    onClose={onClose}
                    name="Sponsor"
                    active={clientType == 'sponsor'}
                    href={fronts.url_sponsor}
                    icon={<IconSponsor />}
                />

                <IdentityMenuItem
                    onClose={onClose}
                    name="Aanbieder"
                    active={clientType == 'provider'}
                    href={fronts.url_provider}
                    icon={<IconProvider />}
                />

                {hasOrganization && <div className="header-account-sep" />}

                <IdentityMenuItem
                    onClose={onClose}
                    name="Uitloggen"
                    url={getStateRouteUrl(DashboardRoutes.SIGN_OUT)}
                    dusk={'btnUserLogout'}
                    icon={<IconSignOut />}
                />
            </div>
        </div>
    );
}
