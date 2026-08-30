import React, { useCallback } from 'react';
import classNames from 'classnames';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import type { AuthPageLoginOption } from '../../../../../../dashboard/services/ConfigService';
import type { OpenIdFlow } from '../../../../../../dashboard/props/models/OpenIdFlow';

export default function StartOptions({
    title,
    loginTitle,
    authOptions,
    openIdFlows,
    loading,
    authInfo,
    onEmail,
    onQr,
    onDigid,
    onOpenId,
}: {
    title: string;
    loginTitle: string;
    authOptions: Array<AuthPageLoginOption>;
    openIdFlows: Array<OpenIdFlow>;
    loading: boolean;
    authInfo: React.ReactNode;
    onEmail: () => void;
    onQr: () => void;
    onDigid: () => void;
    onOpenId: (flow: OpenIdFlow) => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const renderOption = useCallback(
        (option: AuthPageLoginOption) => {
            if (option === 'openid') {
                return openIdFlows.map((flow) => (
                    <div
                        key={`openid_${flow.key}`}
                        className="auth-option"
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        onClick={() => onOpenId(flow)}
                        role="button">
                        <div className="auth-option-media">
                            <img
                                className="auth-option-media-img"
                                src={assetUrl(`/assets/img/icon-auth/icon-auth-${flow.key}.svg`)}
                                alt={`logo ${flow.name}`}
                            />
                        </div>
                        <div className="auth-option-details">
                            <div className="auth-option-title">{flow.name}</div>
                            <div className="auth-option-description">
                                {translate('auth.options.openid.description', { flow_name: flow.name })}
                            </div>
                        </div>
                    </div>
                ));
            }

            const optionConfig = {
                email: {
                    icon: '/assets/img/icon-auth/icon-auth-mail.svg',
                    title: translate('auth.options.email.title'),
                    description: translate('auth.options.email.description'),
                    titleDusk: 'authOptionEmailRegister',
                    descriptionDusk: 'authOptionEmailRestore',
                    onClick: onEmail,
                    alt: '',
                },
                digid: {
                    icon: '/assets/img/icon-auth/icon-auth-digid.svg',
                    title: translate('auth.options.digid.title'),
                    description: translate('auth.options.digid.description'),
                    titleDusk: null,
                    descriptionDusk: null,
                    onClick: onDigid,
                    alt: 'logo DigiD',
                },
                qr: {
                    icon: '/assets/img/icon-auth/icon-auth-me_app.svg',
                    title: translate('auth.options.qr.title'),
                    description: <TranslateHtml i18n={'auth.options.qr.description'} />,
                    titleDusk: null,
                    descriptionDusk: null,
                    onClick: onQr,
                    alt: '',
                },
            }[option];

            return (
                <div
                    key={option}
                    className="auth-option"
                    tabIndex={0}
                    onKeyDown={clickOnKeyEnter}
                    onClick={optionConfig.onClick}
                    role="button">
                    <div className="auth-option-media">
                        <img
                            className="auth-option-media-img"
                            src={assetUrl(optionConfig.icon)}
                            alt={optionConfig.alt}
                        />
                    </div>
                    <div className="auth-option-details">
                        <div className="auth-option-title" data-dusk={optionConfig.titleDusk}>
                            {optionConfig.title}
                        </div>
                        <div className="auth-option-description" data-dusk={optionConfig.descriptionDusk}>
                            {optionConfig.description}
                        </div>
                    </div>
                </div>
            );
        },
        [assetUrl, onDigid, onEmail, onOpenId, onQr, openIdFlows, translate],
    );

    return (
        <div className="block block-auth">
            <div className="auth-wrapper">
                <h1 className="auth-title">{title}</h1>

                <div className="auth-pane">
                    <div className="auth-pane-body">
                        <div className="auth-row">
                            <div className="auth-col">
                                <h2 className="auth-text">
                                    <div className="auth-heading">{loginTitle}</div>
                                </h2>
                                <div className={classNames('auth-options', loading && 'disabled')}>
                                    {authOptions.map((option) => renderOption(option))}
                                </div>

                                {authInfo}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
