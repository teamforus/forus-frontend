import React, { useContext } from 'react';
import Organization from '../../../../props/models/Organization';
import LayoutAsideNavGroup from '../elements/LayoutAsideNavGroup';
import { IconPersonal, IconPersonalActive } from '../icons/LayoutAsideIcons';
import ModalAuthPincode from '../../../../components/modals/ModalAuthPincode';
import useAuthIdentity2FAState from '../../../../hooks/useAuthIdentity2FAState';
import useOpenModal from '../../../../hooks/useOpenModal';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import { authContext } from '../../../../contexts/AuthContext';
import useTranslate from '../../../../hooks/useTranslate';

export default function LayoutAsideGroupPersonal({
    organization,
    pinnedGroups,
    setPinnedGroups,
}: {
    organization: Organization;
    pinnedGroups: Array<string>;
    setPinnedGroups: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const { identity } = useContext(authContext);
    const translate = useTranslate();

    const openModal = useOpenModal();
    const authIdentity2FAState = useAuthIdentity2FAState();

    const linkedAccountsAvailable = Boolean(
        identity?.has_identity_provider_links || identity?.can_link_identity_provider,
    );

    return (
        <LayoutAsideNavGroup
            id="menu_personal_settings"
            name="Persoonlijke instellingen"
            icon={<IconPersonal />}
            iconActive={<IconPersonalActive />}
            pinnedGroups={pinnedGroups}
            setPinnedGroups={setPinnedGroups}
            items={[
                {
                    name: 'E-mail instellingen',
                    state: DashboardRoutes.PREFERENCE_EMAILS,
                    show: !!organization,
                },
                {
                    name: 'Beveiliging',
                    state: DashboardRoutes.SECURITY_2FA,
                    show: organization?.allow_2fa_restrictions || authIdentity2FAState?.required,
                },
                {
                    name: 'Notificatievoorkeuren',
                    state: DashboardRoutes.PREFERENCE_NOTIFICATIONS,
                    show: !!organization,
                },
                {
                    name: 'Autoriseer apparaat',
                    onClick: (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        openModal((modal) => <ModalAuthPincode modal={modal} />);
                    },
                    show: !!organization,
                },
                {
                    name: 'Sessies',
                    state: DashboardRoutes.SECURITY_SESSIONS,
                    show: !!organization,
                },
                {
                    name: translate('organizations_identity_provider_entra.ui.linked_accounts'),
                    state: DashboardRoutes.SECURITY_LINKED_ACCOUNTS,
                    show: linkedAccountsAvailable,
                },
            ]}
        />
    );
}
