import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import usePushApiError from '../../../hooks/usePushApiError';
import useImplementationService from '../../../services/ImplementationService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Implementation from '../../../props/models/Implementation';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { ResponseError } from '../../../props/ApiResponses';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import useFormBuilder from '../../../hooks/useFormBuilder';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushSuccess from '../../../hooks/usePushSuccess';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';

export default function ImplementationAuthPage() {
    const { id } = useParams();

    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();
    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const form = useFormBuilder<{
        auth_page_title: string;
        auth_page_login_title: string;
        auth_page_login_email: boolean;
        auth_page_login_digid: boolean;
        auth_page_login_openid: boolean;
        auth_page_login_qr: boolean;
        auth_page_info_enabled: boolean;
        auth_page_info_title: string;
        auth_page_info_description: string;
        auth_page_info_description_html?: string;
    }>(
        {
            auth_page_title: '',
            auth_page_login_title: '',
            auth_page_login_email: true,
            auth_page_login_digid: true,
            auth_page_login_openid: true,
            auth_page_login_qr: true,
            auth_page_info_enabled: false,
            auth_page_info_title: '',
            auth_page_info_description: '',
            auth_page_info_description_html: '',
        },
        (values) => {
            setProgress(0);

            implementationService
                .updateAuthPage(activeOrganization.id, implementation.id, values)
                .then((res) => {
                    setImplementation(res.data.data);
                    form.setErrors({});
                    pushSuccess('Opgeslagen!');
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update } = form;

    const loginOptions = useMemo(() => {
        const options: Array<{
            key: 'auth_page_login_email' | 'auth_page_login_digid' | 'auth_page_login_openid' | 'auth_page_login_qr';
            label: string;
            tooltip: string;
            available: boolean;
        }> = [
            {
                key: 'auth_page_login_email',
                label: translate('implementation_auth_page.options.email'),
                tooltip: translate('implementation_auth_page.tooltips.email'),
                available: true,
            },
            {
                key: 'auth_page_login_digid',
                label: translate('implementation_auth_page.options.digid'),
                tooltip: implementation?.digid_available
                    ? translate('implementation_auth_page.tooltips.digid')
                    : translate('implementation_auth_page.tooltips.digid_disabled'),
                available: !!implementation?.digid_available,
            },
        ];

        if (activeOrganization.allow_openid) {
            options.push({
                key: 'auth_page_login_openid',
                label: translate('implementation_auth_page.options.openid'),
                tooltip: implementation?.openid_available
                    ? translate('implementation_auth_page.tooltips.openid')
                    : translate('implementation_auth_page.tooltips.openid_disabled'),
                available: !!implementation?.openid_available,
            });
        }

        options.push({
            key: 'auth_page_login_qr',
            label: translate('implementation_auth_page.options.qr'),
            tooltip: translate('implementation_auth_page.tooltips.qr'),
            available: true,
        });

        return options;
    }, [activeOrganization.allow_openid, implementation?.digid_available, implementation?.openid_available, translate]);

    const availableLoginOptions = useMemo(() => {
        return loginOptions.filter((option) => option.available);
    }, [loginOptions]);

    const unavailableLoginOptions = useMemo(() => {
        return loginOptions.filter((option) => !option.available);
    }, [loginOptions]);

    const fetchImplementation = useCallback(() => {
        implementationService
            .read(activeOrganization.id, parseInt(id))
            .then((res) => setImplementation(res.data.data))
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [implementationService, activeOrganization.id, navigateState, id, pushApiError]);

    useEffect(() => {
        fetchImplementation();
    }, [fetchImplementation]);

    useEffect(() => {
        if (implementation) {
            update({
                auth_page_title: implementation.auth_page_title || '',
                auth_page_login_title: implementation.auth_page_login_title || '',
                auth_page_login_email: !!implementation.auth_page_login_email,
                auth_page_login_digid: !!implementation.auth_page_login_digid,
                auth_page_login_openid: !!implementation.auth_page_login_openid,
                auth_page_login_qr: !!implementation.auth_page_login_qr,
                auth_page_info_enabled: !!implementation.auth_page_info_enabled,
                auth_page_info_title: implementation.auth_page_info_title || '',
                auth_page_info_description: implementation.auth_page_info_description || '',
                auth_page_info_description_html: implementation.auth_page_info_description_html || '',
            });
        }
    }, [implementation, update]);

    if (!implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">{translate('implementation_auth_page.title')}</div>
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        <div className="flex flex-grow card-title">{translate('implementation_auth_page.title')}</div>

                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                <a
                                    className="button button-text button-sm"
                                    href={implementation.url_webshop}
                                    target="_blank"
                                    rel="noreferrer">
                                    {translate('implementation_auth_page.buttons.view_page')}
                                    <em className="mdi mdi-open-in-new icon-end" />
                                </a>

                                <button className="button button-primary button-sm" type="submit">
                                    {translate('funds_edit.buttons.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <FormPaneContainer className="card-section">
                        <FormPane title={translate('implementation_auth_page.sections.hero')}>
                            <FormGroup
                                required={true}
                                label={translate('implementation_auth_page.labels.title')}
                                error={form.errors.auth_page_title}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type="text"
                                        className="form-control"
                                        value={form.values?.auth_page_title || ''}
                                        onChange={(e) => form.update({ auth_page_title: e.target.value })}
                                    />
                                )}
                            />
                        </FormPane>

                        <FormPane
                            title={translate('implementation_auth_page.sections.login')}
                            description={translate('implementation_auth_page.descriptions.login')}>
                            <FormGroup
                                required={true}
                                label={translate('implementation_auth_page.labels.login_title')}
                                error={form.errors.auth_page_login_title}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type="text"
                                        className="form-control"
                                        value={form.values?.auth_page_login_title || ''}
                                        onChange={(e) => form.update({ auth_page_login_title: e.target.value })}
                                    />
                                )}
                            />

                            <FormGroup
                                label={translate('implementation_auth_page.labels.login_options')}
                                error={form.errors.auth_page_login_options}
                                input={() => (
                                    <div className="flex flex-vertical">
                                        {availableLoginOptions.map((option) => (
                                            <CheckboxControl
                                                key={option.key}
                                                title={option.label}
                                                tooltip={option.tooltip}
                                                checked={!!form.values?.[option.key]}
                                                onChange={(_, checked) => form.update({ [option.key]: checked })}
                                            />
                                        ))}
                                    </div>
                                )}
                            />

                            {unavailableLoginOptions.length > 0 && (
                                <FormGroup
                                    label={translate('implementation_auth_page.labels.login_options_unavailable')}
                                    hint={translate('implementation_auth_page.hints.login_options_unavailable')}
                                    input={() => (
                                        <div className="flex flex-vertical">
                                            {unavailableLoginOptions.map((option) => (
                                                <CheckboxControl
                                                    key={option.key}
                                                    title={option.label}
                                                    tooltip={option.tooltip}
                                                    checked={!!form.values?.[option.key]}
                                                    disabled={true}
                                                    onChange={() => undefined}
                                                />
                                            ))}
                                        </div>
                                    )}
                                />
                            )}
                        </FormPane>

                        <FormPane title={translate('implementation_auth_page.sections.info')}>
                            <FormGroup
                                label={translate('implementation_auth_page.labels.info_enabled')}
                                error={form.errors.auth_page_info_enabled}
                                input={(id) => (
                                    <ToggleControl
                                        id={id}
                                        className="form-label"
                                        checked={!!form.values?.auth_page_info_enabled}
                                        onChange={(_, checked) => form.update({ auth_page_info_enabled: checked })}
                                    />
                                )}
                            />

                            {form.values?.auth_page_info_enabled && (
                                <FormGroup
                                    label={translate('implementation_auth_page.labels.info_title')}
                                    error={form.errors.auth_page_info_title}
                                    input={(id) => (
                                        <input
                                            id={id}
                                            type="text"
                                            className="form-control"
                                            value={form.values?.auth_page_info_title || ''}
                                            onChange={(e) => form.update({ auth_page_info_title: e.target.value })}
                                        />
                                    )}
                                />
                            )}

                            {form.values?.auth_page_info_enabled && (
                                <FormGroup
                                    label={translate('implementation_auth_page.labels.info_description')}
                                    error={form.errors.auth_page_info_description}
                                    hint={translate('implementation_auth_page.hints.info_description')}
                                    input={() => (
                                        <MarkdownEditor
                                            value={form.values?.auth_page_info_description_html || ''}
                                            placeholder={translate(
                                                'implementation_auth_page.placeholders.info_description',
                                            )}
                                            height={120}
                                            onChange={(value) => form.update({ auth_page_info_description: value })}
                                            onChangeRaw={(e) =>
                                                form.update({
                                                    auth_page_info_description: e.data.content || '',
                                                    auth_page_info_description_html: e.data.content_html || '',
                                                })
                                            }
                                        />
                                    )}
                                />
                            )}
                        </FormPane>
                    </FormPaneContainer>

                    <div className="card-footer card-footer-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className="button button-default">
                                {translate('funds_edit.buttons.cancel')}
                            </StateNavLink>

                            <button className="button button-primary" type="submit">
                                {translate('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
