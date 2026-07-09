import React from 'react';
import EmailProviderLink from '../../../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';

export default function StartEmail({
    title,
    emailForm,
    hasBackTarget,
    authEmailSent,
    communicationType,
    emailValue,
    authInfo,
    onBack,
}: {
    title: string;
    emailForm: React.ReactNode;
    hasBackTarget: boolean;
    authEmailSent: boolean;
    communicationType?: string;
    emailValue: string;
    authInfo: React.ReactNode;
    onBack: () => void;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    return (
        <div className="block block-auth">
            <div className="auth-wrapper auth-wrapper-email">
                <h1 className="auth-title">{title}</h1>

                {!authEmailSent && (
                    <div className="auth-pane">
                        <div className="auth-pane-body">{emailForm}</div>
                        {hasBackTarget && (
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
                        )}
                    </div>
                )}

                {authEmailSent && (
                    <div className="auth-pane">
                        <h1 className="sr-only">{translate('popup_auth.header.title_sr')}</h1>
                        <h2 className="auth-pane-header">{translate('popup_auth.header.title')}</h2>
                        <div className="auth-pane-body" data-dusk="authEmailSentConfirmation">
                            <div className="auth-email-sent">
                                <div className="auth-email-sent-icon">
                                    <img
                                        className="auth-email-sent-icon-img"
                                        src={assetUrl('/assets/img/modal/email_signup.svg')}
                                        alt=""
                                    />
                                </div>
                                <div className="auth-email-sent-title">
                                    {translate(`popup_auth.header.title_email_sent_${communicationType}`)}
                                </div>
                                <TranslateHtml
                                    component={<div className="auth-email-sent-text" />}
                                    i18n={`popup_auth.header.subtitle_email_sent_${communicationType}`}
                                    values={{ email: emailValue }}
                                />
                                <EmailProviderLink email={emailValue} />
                            </div>
                        </div>
                    </div>
                )}

                {authInfo}
            </div>
        </div>
    );
}
