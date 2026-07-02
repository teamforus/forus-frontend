import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authContext } from '../../../../contexts/AuthContext';
import { useNavigateState, useStateHref, useStateParams } from '../../../../modules/state_router/Router';
import { useAuthService } from '../../../../services/AuthService';
import useFormBuilder from '../../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../../dashboard/props/ApiResponses';
import { useIdentityService } from '../../../../../dashboard/services/IdentityService';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import { BooleanParam, useQueryParams } from 'use-query-params';
import { useDigiDService } from '../../../../services/DigiDService';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import FormError from '../../../../../dashboard/components/elements/forms/errors/FormError';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import UIControlText from '../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import TranslateHtml from '../../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useSetTitle from '../../../../hooks/useSetTitle';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import BlockShowcase from '../../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../../elements/block-loader/BlockLoader';
import BindLinksInside from '../../../elements/bind-links-inside/BindLinksInside';
import Markdown from '../../../elements/markdown/Markdown';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import StartOptions from './elements/StartOptions';
import StartEmail from './elements/StartEmail';
import StartQrCode from './elements/StartQrCode';

export default function Start() {
    const { token, signOut, setToken } = useContext(authContext);

    const appConfigs = useAppConfigs();

    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const termsUrl = useStateHref(WebshopRoutes.TERMS_AND_CONDITIONS);
    const privacyUrl = useStateHref(WebshopRoutes.PRIVACY);

    const { target } = useStateParams<{ target?: string }>();
    const [state, setState] = useState<string>('start');
    const [timer, setTimer] = useState(null);
    const [loading, setLoading] = useState(false);

    const [qrValue, setQrValue] = useState<{ type: 'auth_token'; value: string }>(null);
    const [emailValue, setEmailValue] = useState(null);

    const [{ reset, logout, email, digid }, setQueryParams] = useQueryParams(
        {
            reset: BooleanParam,
            logout: BooleanParam,
            email: BooleanParam,
            digid: BooleanParam,
        },
        {
            updateType: 'replace',
        },
    );

    const { onAuthRedirect } = useAuthService();
    const digIdService = useDigiDService();
    const identityService = useIdentityService();

    const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
    const [authEmailSent, setAuthEmailSent] = useState<boolean>(false);

    const signedIn = useMemo(() => !!token, [token]);
    const authPageTitle = appConfigs?.auth_page?.title || translate('auth.title');
    const authPageLoginTitle = appConfigs?.auth_page?.login_title || '';

    const authOptions = useMemo(() => {
        const options = appConfigs?.auth_page?.login_options || [];

        return options
            .filter((option, index) => options.indexOf(option) === index)
            .filter((option) => {
                if (option === 'digid') {
                    return appConfigs?.digid;
                }

                return true;
            });
    }, [appConfigs?.auth_page?.login_options, appConfigs?.digid]);

    const hasEmailOnlyAuth = useMemo(() => {
        return authOptions.length === 1 && authOptions[0] === 'email';
    }, [authOptions]);

    const hasEmailBackTarget = useMemo(() => {
        return authOptions.some((option) => option !== 'email');
    }, [authOptions]);

    const hasQrBackTarget = useMemo(() => {
        return authOptions.some((option) => option !== 'qr');
    }, [authOptions]);

    const showPrivacy = useMemo(() => {
        return appConfigs?.show_privacy_checkbox && appConfigs?.pages.privacy && state === 'email';
    }, [appConfigs, state]);

    const showTerms = useMemo(() => {
        return appConfigs?.show_terms_checkbox && appConfigs?.pages.terms_and_conditions && state === 'email';
    }, [appConfigs, state]);

    const authForm = useFormBuilder(
        {
            email: '',
            target: target || 'fundRequest',
            privacy: false,
            terms: false,
        },
        async (values) => {
            if ((!values.privacy && showPrivacy) || (!values.terms && showTerms)) {
                // prevent submit if policy exist and not checked
                authForm.setIsLocked(false);
                return;
            }

            const handleErrors = (res: ResponseError) => {
                authForm.setIsLocked(false);
                authForm.setErrors(res.data.errors ? res.data.errors : { email: [res.data.message] });
            };

            setProgress(0);

            return identityService
                .make(values)
                .then(() => {
                    setEmailValue(values.email);
                    setAuthEmailSent(true);
                    authForm.reset();
                    setState('email');
                }, handleErrors)
                .finally(() => setProgress(100));
        },
    );

    const { reset: authFormReset } = authForm;

    const startDigId = useCallback(() => {
        setLoading(true);
        setProgress(0);

        digIdService
            .startAuthRestore()
            .then((res) => (document.location = res.data.redirect_url))
            .catch((res: ResponseError) => navigateState(WebshopRoutes.ERROR, { errorCode: res.headers['error-code'] }))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [digIdService, navigateState, setProgress]);

    const showStart = useCallback(() => {
        setState('start');
    }, []);

    const showEmail = useCallback(() => {
        window.setTimeout(() => setState('email'), 0);
    }, []);

    const showQr = useCallback(() => {
        setState('qr');
    }, []);

    const checkAccessTokenStatus = useCallback(
        (access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                } else if (res.data.message == 'pending') {
                    setTimer(window.setTimeout(() => checkAccessTokenStatus(access_token), 2500));
                } else {
                    document.location.reload();
                }
            });
        },
        [identityService, setToken],
    );

    const loadQrCode = useCallback(() => {
        identityService.makeAuthToken().then((res) => {
            setQrValue({ type: 'auth_token', value: res.data.auth_token });
            checkAccessTokenStatus(res.data.access_token);
        }, console.error);
    }, [checkAccessTokenStatus, identityService]);

    useEffect(() => {
        if (state == 'qr' && !qrValue) {
            loadQrCode();
        }

        if (state !== 'qr') {
            setQrValue(null);
            window.clearTimeout(timer);
        }

        return () => {
            window.clearTimeout(timer);
        };
    }, [loadQrCode, state, timer, qrValue]);

    useEffect(() => {
        if (!appConfigs) {
            return;
        }

        if (logout) {
            signOut(null, false, true, false);
        }

        if (digid) {
            startDigId();
        }

        if (!digid && email && authOptions.includes('email')) {
            setAuthEmailSent(false);
            authFormReset();
            setState('email');
        }

        if (reset) {
            setAuthEmailSent(false);
            setState('start');
        }

        setQueryParams({ logout: null, email: null, digid: null, reset: null });
    }, [appConfigs, reset, logout, email, authOptions, digid, setQueryParams, signOut, startDigId, authFormReset]);

    useEffect(() => {
        if (appConfigs && hasEmailOnlyAuth && state === 'start') {
            setState('email');
        }
    }, [appConfigs, hasEmailOnlyAuth, state]);

    useEffect(() => {
        if (signedIn) {
            onAuthRedirect().then();
        }
    }, [onAuthRedirect, signedIn]);

    useEffect(() => {
        if (authPageTitle) {
            setTitle(authPageTitle);
        }
    }, [authPageTitle, setTitle]);

    useEffect(() => {
        if ((!authForm?.values?.privacy && showPrivacy) || (!authForm?.values?.terms && showTerms)) {
            setDisableSubmitBtn(true);
        } else {
            setDisableSubmitBtn(false);
        }
    }, [authForm?.values?.privacy, authForm?.values?.terms, showPrivacy, showTerms]);

    const privacyCheckbox = useCallback(() => {
        return showPrivacy ? (
            <div className="row">
                <div className="col col-lg-12">
                    <br className="hidden-lg" />
                    <label
                        className="auth-text auth-text-sm auth-privacy"
                        htmlFor="privacy"
                        tabIndex={2}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            clickOnKeyEnter(e);
                        }}>
                        <input
                            type="checkbox"
                            data-dusk={'privacyCheckbox'}
                            className={'auth-privacy-checkbox'}
                            checked={authForm.values.privacy}
                            onChange={(e) => {
                                authForm.update({ privacy: e.target.checked });
                                e.target?.parentElement?.focus();
                            }}
                            id="privacy"
                        />
                        <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                            <strong>
                                <TranslateHtml i18n={'auth.privacy_link.text'} values={{ link_url: privacyUrl }} />
                            </strong>
                        </BindLinksInside>
                    </label>
                </div>
            </div>
        ) : null;
    }, [authForm, showPrivacy, privacyUrl]);

    const termsCheckbox = useCallback(() => {
        return showTerms ? (
            <div className="row">
                <div className="col col-lg-12">
                    <br className="hidden-lg" />
                    <label
                        className="auth-text auth-text-sm auth-privacy"
                        htmlFor="terms"
                        tabIndex={2}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            clickOnKeyEnter(e);
                        }}>
                        <input
                            type="checkbox"
                            className={'auth-privacy-checkbox'}
                            checked={authForm.values.terms}
                            onChange={(e) => {
                                authForm.update({ terms: e.target.checked });
                                e.target?.parentElement?.focus();
                            }}
                            id="terms"
                        />
                        <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                            <strong>
                                <TranslateHtml i18n={'auth.terms_link.text'} values={{ link_url: termsUrl }} />
                            </strong>
                        </BindLinksInside>
                    </label>
                </div>
            </div>
        ) : null;
    }, [authForm, showTerms, termsUrl]);

    const inlineEmailForm = useCallback(
        (showCheckboxes = true) => (
            <form className="form auth-form" onSubmit={authForm.submit} data-dusk="authEmailForm">
                <div className="auth-form-row">
                    <div className="form-group auth-form-field">
                        <label className="form-label" htmlFor="email">
                            <strong>{translate('popup_auth.input.mail')}</strong>
                        </label>
                        <div className="flex flex-vertical flex-gap">
                            <div>
                                <UIControlText
                                    value={authForm.values.email}
                                    onChange={(e) => authForm.update({ email: e.target.value })}
                                    id={'email'}
                                    name={'email'}
                                    tabIndex={1}
                                    autoFocus={true}
                                    dataDusk={'authEmailFormEmail'}
                                    autoComplete={'email'}
                                />
                                <FormError error={authForm.errors.email} />
                            </div>
                            <div className="auth-form-field-hint">
                                <TranslateHtml i18n={'auth_start.example'} />
                            </div>
                        </div>
                    </div>
                    <div className="form-group auth-form-actions">
                        <label className="form-label hide-sm" htmlFor="submit">
                            &nbsp;
                        </label>
                        <button
                            id={'submit'}
                            className="button button-primary button-fill"
                            type="submit"
                            disabled={showCheckboxes && disableSubmitBtn}
                            data-dusk="authEmailFormSubmit"
                            tabIndex={4}>
                            {translate('popup_auth.buttons.submit')}
                        </button>
                    </div>
                </div>

                {showCheckboxes && privacyCheckbox()}
                {showCheckboxes && termsCheckbox()}
            </form>
        ),
        [authForm, disableSubmitBtn, privacyCheckbox, termsCheckbox, translate],
    );

    const authPageInfoTitle = appConfigs?.auth_page?.info_title;
    const authPageInfoDescriptionHtml = appConfigs?.auth_page?.info_description_html;
    const showAuthInfo = !!appConfigs?.auth_page?.info_enabled && !!(authPageInfoTitle || authPageInfoDescriptionHtml);

    const authInfo = showAuthInfo && (
        <div className="auth-info">
            {authPageInfoTitle && <h2 className="auth-heading">{authPageInfoTitle}</h2>}

            {authPageInfoDescriptionHtml && <Markdown content={authPageInfoDescriptionHtml} className="auth-text" />}
        </div>
    );

    return (
        <BlockShowcase breadcrumbItems={[]} loaderElement={<BlockLoader type={'full'} />}>
            {!signedIn && (
                <header className="section section-auth">
                    <div className="wrapper">
                        {state === 'start' && (
                            <StartOptions
                                title={authPageTitle}
                                loginTitle={authPageLoginTitle}
                                authOptions={authOptions}
                                loading={loading}
                                authInfo={authInfo}
                                onEmail={showEmail}
                                onQr={showQr}
                                onDigid={startDigId}
                            />
                        )}

                        {state == 'email' && (
                            <StartEmail
                                title={authPageTitle}
                                emailForm={inlineEmailForm()}
                                hasBackTarget={hasEmailBackTarget}
                                authEmailSent={authEmailSent}
                                communicationType={appConfigs?.communication_type}
                                emailValue={emailValue}
                                authInfo={authInfo}
                                onBack={showStart}
                            />
                        )}

                        {state == 'qr' && (
                            <StartQrCode
                                title={authPageTitle}
                                qrValue={qrValue}
                                hasBackTarget={hasQrBackTarget}
                                authInfo={authInfo}
                                onBack={showStart}
                            />
                        )}
                    </div>
                </header>
            )}
        </BlockShowcase>
    );
}
