import React, { useCallback } from 'react';
import classNames from 'classnames';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import type { AuthPageLoginOption } from '../../../../../../dashboard/services/ConfigService';

export default function StartOptions({
    title,
    loginTitle,
    authOptions,
    loading,
    authInfo,
    onEmail,
    onQr,
    onDigid,
}: {
    title: string;
    loginTitle: string;
    authOptions: Array<AuthPageLoginOption>;
    loading: boolean;
    authInfo: React.ReactNode;
    onEmail: () => void;
    onQr: () => void;
    onDigid: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const renderOption = useCallback(
        (option: AuthPageLoginOption) => {
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
        [assetUrl, onDigid, onEmail, onQr, translate],
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
