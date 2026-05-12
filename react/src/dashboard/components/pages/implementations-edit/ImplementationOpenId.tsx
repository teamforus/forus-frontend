import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useSetProgress from '../../../hooks/useSetProgress';
import { ResponseError } from '../../../props/ApiResponses';
import useImplementationService from '../../../services/ImplementationService';
import { useParams } from 'react-router';
import Implementation from '../../../props/models/Implementation';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import InfoBox from '../../elements/info-box/InfoBox';

export default function ImplementationOpenId() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();

    const implementationService = useImplementationService();

    const [implementation, setImplementation] = useState<Implementation>(null);

    const form = useFormBuilder<{
        openid_verid_enabled: boolean;
    }>(
        {
            openid_verid_enabled: false,
        },
        (values) => {
            setProgress(0);

            implementationService
                .updateOpenId(activeOrganization.id, implementation.id, values)
                .then((res) => {
                    setImplementation(res.data.data);
                    form.setErrors({});
                    pushSuccess(translate('implementation_auth_page.openid_settings.notifications.saved'));
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors || {});
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update } = form;

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
        if (activeOrganization && !activeOrganization.allow_openid) {
            navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
        }
    }, [activeOrganization, navigateState]);

    useEffect(() => {
        if (implementation) {
            update({ openid_verid_enabled: implementation.openid_verid_enabled });
        }
    }, [update, implementation]);

    if (!activeOrganization.allow_openid || !implementation) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">
                    {translate('implementation_auth_page.openid_settings.title')}
                </div>
            </div>

            <form className="form card" onSubmit={form.submit}>
                <div className="card-header">
                    <div className="card-title">{translate('implementation_auth_page.openid_settings.page_title')}</div>
                </div>

                <FormPaneContainer className="card-section">
                    {!implementation.openid_verid_configured && (
                        <InfoBox type="warning">
                            {translate('implementation_auth_page.openid_settings.info.not_configured')}
                        </InfoBox>
                    )}

                    <FormPane title={translate('implementation_auth_page.openid_settings.sections.settings')}>
                        <FormGroup
                            label={translate('implementation_auth_page.openid_settings.labels.status')}
                            input={(id) => (
                                <ToggleControl
                                    id={id}
                                    className="form-label"
                                    checked={form.values?.openid_verid_enabled}
                                    onChange={(e) => form.update({ openid_verid_enabled: e.target.checked })}
                                />
                            )}
                        />
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
        </Fragment>
    );
}
