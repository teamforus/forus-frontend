import useTranslate from '../../../../../hooks/useTranslate';
import React, { useCallback } from 'react';
import useIdentityProviderAction from '../../hooks/useIdentityProviderAction';
import { useIdentityProviderConnectionService } from '../../../../../services/IdentityProviderConnectionService';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';

export default function EntraConnectionSetupState({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const identityProviderConnectionService = useIdentityProviderConnectionService();

    const { busy, runAction } = useIdentityProviderAction();

    const startConsent = useCallback(() => {
        runAction(() => identityProviderConnectionService.startConsent(organizationId), {
            successMessage: null,
            onSuccess: (response) => window.location.assign(response.data.data.redirect_url),
        }).then();
    }, [identityProviderConnectionService, organizationId, runAction]);

    return (
        <EmptyCard
            title="Microsoft Entra"
            description={translate('organizations_identity_provider_entra.ui.setup_description')}
            imageIconSvg={<em className="mdi mdi-microsoft flex-grow text-center" aria-hidden="true" />}
            actions={
                <button type="button" className="button button-primary" disabled={busy} onClick={startConsent}>
                    <em className="mdi mdi-link-variant icon-start" />
                    {translate('organizations_identity_provider_entra.ui.connect')}
                </button>
            }
        />
    );
}
