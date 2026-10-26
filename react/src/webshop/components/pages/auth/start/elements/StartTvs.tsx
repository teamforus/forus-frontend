import React from 'react';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import { AppConfigProp } from '../../../../../../dashboard/services/ConfigService';
import useAssetUrl from '../../../../../hooks/useAssetUrl';

export default function StartTvs({
    organizations,
    authInfo,
    onBack,
    onSelect,
}: {
    organizations?: AppConfigProp['digid_tvs_organizations'];
    authInfo: React.ReactNode;
    onBack: () => void;
    onSelect: (organizationId: number) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="block block-auth">
            <div className="auth-wrapper">
                <h1 className="auth-title">{translate('auth.header.digid.title')}</h1>

                <div className="auth-pane">
                    <div className="auth-pane-body">
                        <div className="auth-row">
                            <div className="auth-col">
                                <h2 className="auth-text">
                                    <div className="auth-heading">{translate('auth.header.digid.description')}</div>
                                </h2>
                                <div className="auth-options">
                                    {organizations?.map((organization) => (
                                        <div
                                            key={organization.id}
                                            className="auth-option"
                                            tabIndex={0}
                                            onKeyDown={clickOnKeyEnter}
                                            aria-label={organization.name}
                                            onClick={() => onSelect(organization.id)}
                                            role="button">
                                            <div className="auth-option-media">
                                                <img
                                                    className="auth-option-media-img"
                                                    src={
                                                        organization.logo_url ||
                                                        assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                                    }
                                                    alt={organization.name}
                                                />
                                            </div>
                                            <div className="auth-option-details">
                                                <div className="auth-option-title">{organization.name}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="auth-pane-footer">
                        <div className="flex flex-horizontal flex-center">
                            <div className="flex flex-grow">
                                <div
                                    role={'button'}
                                    tabIndex={4}
                                    onKeyDown={clickOnKeyEnter}
                                    className="button button-text button-text-padless"
                                    onClick={onBack}>
                                    <em className="mdi mdi-chevron-left icon-lefts" />
                                    {translate('auth.back')}
                                </div>
                            </div>
                            <div className="flex">&nbsp;</div>
                        </div>
                    </div>
                </div>

                {authInfo}
            </div>
        </div>
    );
}
