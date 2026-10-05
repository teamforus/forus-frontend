import React, { Fragment, useEffect, useMemo, useState } from 'react';
import UIControlText from '../../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import FormError from '../../../../../../dashboard/components/elements/forms/errors/FormError';
import Fund from '../../../../../props/models/Fund';
import useFormBuilder from '../../../../../../dashboard/hooks/useFormBuilder';
import { useIdentityEmailsService } from '../../../../../../dashboard/services/IdentityEmailService';
import useTranslate from '../../../../../../dashboard/hooks/useTranslate';
import FundRequestGoBackButton from '../FundRequestGoBackButton';
import { clickOnKeyEnter } from '../../../../../../dashboard/helpers/wcag';
import TranslateHtml from '../../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import EmailProviderLink from '../../../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import useAppConfigs from '../../../../../hooks/useAppConfigs';
import SignUpFooter from '../../../../elements/sign-up/SignUpFooter';
import BindLinksInside from '../../../../elements/bind-links-inside/BindLinksInside';
import { useStateHref } from '../../../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../../../modules/state_router/RouterBuilder';

export default function FundRequestStepEmailSetup({
    fund,
    step,
    prevStep,
    nextStep,
    progress,
    bsnWarning,
    walletEmail,
    walletDisclosureId,
}: {
    fund: Fund;
    step: number;
    prevStep: () => void;
    nextStep: () => void;
    progress: React.ReactElement;
    bsnWarning: React.ReactElement;
    walletDisclosureId?: number;
    walletEmail?: {
        email: string | null;
        can_use_email: boolean;
        onConfirm: () => Promise<void>;
    };
}) {
    const assetUrl = useAssetUrl();
    const appConfigs = useAppConfigs();

    const translate = useTranslate();
    const identityEmailsService = useIdentityEmailsService();

    const termsUrl = useStateHref(WebshopRoutes.TERMS_AND_CONDITIONS);
    const privacyUrl = useStateHref(WebshopRoutes.PRIVACY);

    const [skipEmail, setSkipEmail] = useState(false);
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
    const [manualEmail, setManualEmail] = useState(false);
    const [walletEmailUnavailable, setWalletEmailUnavailable] = useState(false);

    const showWalletEmail = walletEmail?.email && walletEmail.can_use_email && !manualEmail;
    const emailSetupRequired = useMemo(() => fund?.email_required, [fund?.email_required]);

    const hasPrivacy = useMemo(() => {
        return appConfigs?.show_privacy_checkbox && appConfigs?.pages.privacy;
    }, [appConfigs]);

    const hasTerms = useMemo(() => {
        return appConfigs?.show_terms_checkbox && appConfigs?.pages.terms_and_conditions;
    }, [appConfigs]);

    const emailForm = useFormBuilder<{ email: string; privacy: boolean; terms: boolean }>(
        {
            email: ``,
            privacy: false,
            terms: false,
        },
        (values) => {
            if ((hasPrivacy && !values.privacy) || (hasTerms && !values.terms)) {
                emailForm.setIsLocked(false);
                return;
            }

            if (showWalletEmail) {
                if (skipEmail && !emailSetupRequired) {
                    emailForm.setIsLocked(false);
                    nextStep();
                    return;
                }

                emailForm.setErrors({});

                return walletEmail
                    .onConfirm()
                    .catch((res) => {
                        if (res?.status === 422) {
                            setWalletEmailUnavailable(true);
                            setManualEmail(true);
                        } else {
                            emailForm.setErrors({
                                email: [translate('fund_request.sign_up.fund_request_email_setup.wallet_email.failed')],
                            });
                        }
                    })
                    .finally(() => emailForm.setIsLocked(false));
            }

            identityEmailsService
                .store(values.email, { target: ['fundApply', fund.id, walletDisclosureId].filter(Boolean).join('-') })
                .then(() => setEmailSubmitted(true))
                .catch((res) => {
                    emailForm.setErrors(res.status === 429 ? { email: [res.data.message] } : res.data.errors);
                })
                .finally(() => emailForm.setIsLocked(false));
        },
    );

    useEffect(() => {
        if ((!emailForm?.values?.privacy && hasPrivacy) || (!emailForm?.values?.terms && hasTerms)) {
            setDisableSubmitBtn(true);
        } else {
            setDisableSubmitBtn(false);
        }
    }, [emailForm?.values?.privacy, emailForm?.values?.terms, hasPrivacy, hasTerms]);

    return (
        <Fragment>
            {progress}

            {emailSubmitted ? (
                <div className="sign_up-pane">
                    <h1 className="sr-only">
                        {translate('fund_request.sign_up.fund_request_email_setup.email_sent_screen')}
                    </h1>
                    <h2 className="sign_up-pane-header">
                        {translate('fund_request.sign_up.fund_request_email_setup.email_sent')}
                    </h2>

                    <div className="sign_up-pane-body">
                        <div className="sign_up-email_sent" data-dusk="fundRequestEmailSent">
                            <div className="sign_up-email_sent-icon">
                                <img
                                    className="sign_up-email_sent-icon-img"
                                    src={assetUrl('/assets/img/modal/email_signup.svg')}
                                    alt=""
                                />
                            </div>
                            <div className="sign_up-email_sent-title">
                                {translate(`popup_auth.header.title_email_sent_${appConfigs?.communication_type}`)}
                            </div>
                            <TranslateHtml
                                component={<div className="sign_up-email_sent-text" />}
                                i18n={`popup_auth.header.subtitle_email_sent_${appConfigs?.communication_type}`}
                                values={{ email: emailForm.values.email }}
                            />
                            <EmailProviderLink email={emailForm.values.email} />
                        </div>
                    </div>

                    {bsnWarning}
                </div>
            ) : (
                <div className="sign_up-pane">
                    <div className="sign_up-pane-header">
                        <h2 className="sign_up-pane-header-title">
                            {showWalletEmail
                                ? translate('fund_request.sign_up.fund_request_email_setup.wallet_email.header')
                                : translate('fund_request.sign_up.fund_request_email_setup.sign_up_with_email')}
                        </h2>
                    </div>
                    <div className="sign_up-pane-body">
                        <form onSubmit={emailForm.submit} data-dusk="fundRequestEmailForm">
                            {emailSetupRequired && (
                                <p className="sign_up-pane-text">
                                    {translate('fund_request.sign_up.fund_request_email_setup.email_required')}
                                </p>
                            )}
                            {(walletEmailUnavailable || (walletEmail?.email && !walletEmail.can_use_email)) && (
                                <p className="sign_up-pane-text" role="status">
                                    {translate(
                                        'fund_request.sign_up.fund_request_email_setup.wallet_email.unavailable',
                                    )}
                                </p>
                            )}

                            {showWalletEmail && skipEmail ? (
                                <div className="form-group">
                                    <h3 className="sign_up-pane-heading">
                                        {translate(
                                            'fund_request.sign_up.fund_request_email_setup.wallet_email.skip_title',
                                        )}
                                    </h3>
                                    <div className="sign_up-info">
                                        <div className="sign_up-info-title">
                                            <div className="sign_up-info-title-icon">
                                                <div className="mdi mdi-information-outline" aria-hidden="true" />
                                            </div>
                                            <div className="sign_up-info-description">
                                                <strong>
                                                    {translate(
                                                        'fund_request.sign_up.fund_request_email_setup.warning',
                                                    )}{' '}
                                                </strong>
                                                {translate(
                                                    'fund_request.sign_up.fund_request_email_setup.no_email_info',
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="sign_up-pane-link sign_up-pane-link-button text-primary"
                                        disabled={emailForm.isLocked}
                                        onClick={() => setSkipEmail(false)}>
                                        {translate(
                                            'fund_request.sign_up.fund_request_email_setup.wallet_email.use_email',
                                        )}
                                    </button>
                                </div>
                            ) : showWalletEmail ? (
                                <div className="form-group">
                                    <h3 className="sign_up-pane-heading sign_up-pane-heading-marginless">
                                        {translate('fund_request.sign_up.fund_request_email_setup.wallet_email.title')}
                                    </h3>
                                    <p className="sign_up-pane-text">
                                        {translate(
                                            'fund_request.sign_up.fund_request_email_setup.wallet_email.description',
                                        )}
                                    </p>
                                    <div className="preview-item-panel">
                                        <div className="preview-item-values">
                                            <div className="preview-item-values-item">
                                                <div className="preview-item-values-item-label">
                                                    {translate(
                                                        'fund_request.sign_up.fund_request_email_setup.wallet_email.label',
                                                    )}
                                                </div>
                                                <div className="preview-item-values-item-value">
                                                    {walletEmail.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <FormError error={emailForm.errors.email} />
                                    <div className="flex flex-gap">
                                        <span>
                                            <button
                                                type="button"
                                                className="sign_up-pane-link sign_up-pane-link-button text-primary"
                                                disabled={emailForm.isLocked}
                                                onClick={() => {
                                                    setManualEmail(true);
                                                    setSkipEmail(false);
                                                    emailForm.setErrors({});
                                                }}>
                                                {translate(
                                                    'fund_request.sign_up.fund_request_email_setup.wallet_email.use_another',
                                                )}
                                            </button>
                                        </span>
                                        {!emailSetupRequired && (
                                            <Fragment>
                                                <span className="flex flex-vertical flex-center" aria-hidden="true">
                                                    |
                                                </span>
                                                <button
                                                    type="button"
                                                    className="sign_up-pane-link sign_up-pane-link-button text-muted"
                                                    disabled={emailForm.isLocked}
                                                    onClick={() => {
                                                        setSkipEmail(true);
                                                        emailForm.setErrors({});
                                                    }}>
                                                    {translate(
                                                        'fund_request.sign_up.fund_request_email_setup.wallet_email.skip',
                                                    )}
                                                </button>
                                            </Fragment>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <div className="row">
                                        <div className="col col-lg-9">
                                            <label className="form-label" htmlFor="email">
                                                {translate('popup_auth.input.mail')}
                                            </label>
                                            <UIControlText
                                                type={'email'}
                                                value={emailForm.values.email}
                                                onChangeValue={(email) => {
                                                    emailForm.update({ email });
                                                }}
                                                tabIndex={0}
                                                autoComplete={'email'}
                                                dataDusk="fundRequestEmailInput"
                                            />
                                            <FormError error={emailForm.errors.email} />
                                        </div>
                                        <div className="col col-lg-3">
                                            <div className="form-label hide-sm">&nbsp;</div>
                                            <button
                                                className="button button-primary button-fill"
                                                disabled={disableSubmitBtn || emailForm.isLocked}
                                                type="submit"
                                                tabIndex={0}
                                                data-dusk="fundRequestEmailSubmit">
                                                {translate('popup_auth.buttons.submit')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-vertical flex-gap">
                                <div className="flex flex-vertical">
                                    {hasPrivacy ? (
                                        <div className="row">
                                            <div className="col col-lg-12">
                                                <br className="hidden-lg" />
                                                <label
                                                    className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
                                                    htmlFor="privacy"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        e.stopPropagation();
                                                        clickOnKeyEnter(e);
                                                    }}>
                                                    <input
                                                        type="checkbox"
                                                        required={Boolean(showWalletEmail)}
                                                        checked={emailForm.values.privacy}
                                                        onChange={(e) => {
                                                            emailForm.update({ privacy: e.target.checked });
                                                            e.target?.parentElement?.focus();
                                                        }}
                                                        id="privacy"
                                                    />
                                                    <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                                                        <strong>
                                                            <TranslateHtml
                                                                i18n={
                                                                    showWalletEmail
                                                                        ? 'fund_request.sign_up.fund_request_email_setup.wallet_email.privacy'
                                                                        : 'auth.privacy_link.text'
                                                                }
                                                                values={{ link_url: privacyUrl }}
                                                            />
                                                            {showWalletEmail && <span className="text-danger"> *</span>}
                                                        </strong>
                                                    </BindLinksInside>
                                                </label>
                                            </div>
                                        </div>
                                    ) : null}

                                    {hasTerms ? (
                                        <div className="row">
                                            <div className="col col-lg-12">
                                                <br className="hidden-lg" />
                                                <label
                                                    className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
                                                    htmlFor="terms"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => {
                                                        e.stopPropagation();
                                                        clickOnKeyEnter(e);
                                                    }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={emailForm.values.terms}
                                                        onChange={(e) => {
                                                            emailForm.update({ terms: e.target.checked });
                                                            e.target?.parentElement?.focus();
                                                        }}
                                                        id="terms"
                                                    />
                                                    <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                                                        <strong>
                                                            <TranslateHtml
                                                                i18n={'auth.terms_link.text'}
                                                                values={{ link_url: termsUrl }}
                                                            />
                                                        </strong>
                                                    </BindLinksInside>
                                                </label>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {showWalletEmail && (
                                    <div>
                                        <button
                                            type="submit"
                                            className="button button-primary"
                                            disabled={disableSubmitBtn || emailForm.isLocked}>
                                            {translate(
                                                'fund_request.sign_up.fund_request_email_setup.wallet_email.confirm',
                                            )}
                                        </button>
                                    </div>
                                )}

                                {!showWalletEmail && !emailSetupRequired && (
                                    <Fragment>
                                        {skipEmail ? (
                                            <div className="sign_up-info">
                                                <div className="sign_up-info-title">
                                                    <div className="sign_up-info-title-icon">
                                                        <div className="mdi mdi-information-outline" />
                                                    </div>
                                                    {translate(
                                                        'fund_request.sign_up.fund_request_email_setup.continue_without_email',
                                                    )}
                                                </div>
                                                <div className="sign_up-info-description flex flex-vertical flex-gap">
                                                    <div>
                                                        <span className="text-strong">
                                                            {translate(
                                                                'fund_request.sign_up.fund_request_email_setup.warning',
                                                            )}{' '}
                                                        </span>
                                                        {translate(
                                                            'fund_request.sign_up.fund_request_email_setup.no_email_info',
                                                        )}
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="text-primary-light sign_up-pane-link sign_up-pane-link-button"
                                                            aria-disabled={disableSubmitBtn || emailForm.isLocked}
                                                            onClick={() => nextStep()}
                                                            disabled={disableSubmitBtn || emailForm.isLocked}
                                                            data-dusk="fundRequestContinueWithoutEmail">
                                                            {translate(
                                                                'fund_request.sign_up.fund_request_email_setup.continue_without_email_link',
                                                            )}
                                                            <em className="mdi mdi-chevron-right" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="sign_up-pane-link sign_up-pane-link-button"
                                                aria-disabled={disableSubmitBtn || emailForm.isLocked}
                                                onClick={() => setSkipEmail(true)}
                                                disabled={disableSubmitBtn || emailForm.isLocked}
                                                data-dusk="fundRequestSkipEmail">
                                                {translate(
                                                    'fund_request.sign_up.fund_request_email_setup.no_email_link',
                                                )}
                                            </button>
                                        )}
                                    </Fragment>
                                )}
                            </div>
                        </form>
                    </div>

                    <SignUpFooter
                        startActions={
                            <FundRequestGoBackButton prevStep={prevStep} fund={fund} step={step} tabIndex={0} />
                        }
                    />

                    {bsnWarning}
                </div>
            )}
        </Fragment>
    );
}
