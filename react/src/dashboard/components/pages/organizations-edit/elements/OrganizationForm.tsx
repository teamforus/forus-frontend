import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mainContext } from '../../../../contexts/MainContext';
import PhotoSelector from '../../../elements/photo-selector/PhotoSelector';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import { useOrganizationService } from '../../../../services/OrganizationService';
import Organization from '../../../../props/models/Organization';
import CheckboxControl from '../../../elements/forms/controls/CheckboxControl';
import SelectControl from '../../../elements/select-control/SelectControl';
import BusinessType from '../../../../props/models/BusinessType';
import { useBusinessTypeService } from '../../../../services/BusinessTypeService';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../../modules/state_router/Router';
import { useMediaService } from '../../../../services/MediaService';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';
import MarkdownEditor from '../../../elements/forms/markdown-editor/MarkdownEditor';
import useUpdateActiveOrganization from '../../../../hooks/useUpdateActiveOrganization';
import { ResponseError } from '../../../../props/ApiResponses';
import useEnvData from '../../../../hooks/useEnvData';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import Media from '../../../../props/models/Media';
import useTranslate from '../../../../hooks/useTranslate';
import usePushApiError from '../../../../hooks/usePushApiError';
import SelectControlOptionsFD from '../../../elements/select-control/templates/SelectControlOptionsFD';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import TranslateHtml from '../../../elements/translate-html/TranslateHtml';
import FormGroupInfo from '../../../elements/forms/elements/FormGroupInfo';
import FormPane from '../../../elements/forms/elements/FormPane';
import FormGroup from '../../../elements/forms/elements/FormGroup';

export default function OrganizationForm() {
    const { organizationId } = useParams();
    const { fetchOrganizations } = useContext(mainContext);
    const updateActiveOrganization = useUpdateActiveOrganization();

    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const envData = useEnvData();
    const isProvider = useMemo(() => envData?.client_type === 'provider', [envData?.client_type]);

    const [media, setMedia] = useState<Media>(null);
    const [mediaFile, setMediaFile] = useState<Blob>(null);
    const mediaService = useMediaService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();
    const { apiResourceToForm } = organizationService;
    const navigateState = useNavigateState();

    const [organization, setOrganization] = useState<Organization>(null);
    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);

    const fetchBusinessTypes = useCallback(() => {
        setProgress(0);

        businessTypeService
            .list({ per_page: 9999 })
            .then((res) => setBusinessTypes(res.data.data))
            .finally(() => setProgress(100));
    }, [businessTypeService, setProgress]);

    const fetchOrganization = useCallback(
        (id: number) => {
            setProgress(0);

            organizationService
                .read(id)
                .then((res) => setOrganization(res.data.data))
                .finally(() => setProgress(100));
        },
        [organizationService, setProgress],
    );

    const uploadMedia = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!mediaFile) {
                return resolve(media?.uid);
            }

            setProgress(0);

            return mediaService
                .store('organization_logo', mediaFile)
                .then((res) => {
                    setMedia(res.data.data);
                    setMediaFile(null);
                    resolve(res.data.data.uid);
                })
                .catch(reject)
                .finally(() => setProgress(100));
        });
    }, [media, mediaFile, mediaService, setProgress]);

    const form = useFormBuilder<{
        iban?: string;
        name?: string;
        phone?: string;
        phone_public?: boolean;
        email?: string;
        email_public?: boolean;
        website?: string;
        website_public?: boolean;
        media_uid?: string;
        description?: string;
        description_html?: string;
        kvk?: string;
        btw?: string;
        business_type_id?: number;
    }>(null, (values) => {
        if (typeof values.iban === 'string') {
            values.iban = values.iban.replace(/\s/g, '');
        }

        uploadMedia().then((uid: string) => {
            values.media_uid = uid;
            setProgress(0);

            const promise = organization
                ? organizationService.update(organization.id, values)
                : organizationService.store(values);

            promise
                .then((res) => {
                    navigateState(DashboardRoutes.ORGANIZATIONS);
                    pushSuccess('Gelukt!');
                    fetchOrganizations().then(() => {
                        organizationService.use(res.data.data.id);
                        updateActiveOrganization(res.data.data);
                    });
                })
                .catch((err: ResponseError) => {
                    form.setIsLocked(false);
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => setProgress(100));
        });
    });

    const { update } = form;

    useEffect(() => {
        if (organization) {
            update({ ...apiResourceToForm(organization) });
        }
    }, [apiResourceToForm, update, organization]);

    useEffect(() => {
        if (organizationId) {
            fetchOrganization(parseInt(organizationId));
        }
    }, [organizationId, fetchOrganization]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        if (!organizationId && businessTypes) {
            update({ business_type_id: businessTypes[0]?.id });
        }
    }, [businessTypes, organizationId, update]);

    if ((organizationId && !organization) || !businessTypes) {
        return <LoadingCard />;
    }

    return (
        <form className="card form" onSubmit={form.submit}>
            <div className="card-header">
                <div className="card-title">
                    {translate(
                        organizationId ? 'organization_edit.header.title_edit' : 'organization_edit.header.title_add',
                    )}
                </div>
            </div>

            <div className="card-section">
                <div className="row">
                    <div className="col col-md-10 col-md-offset-1 col-xs-12">
                        <div className="flex flex-gap flex-vertical">
                            <FormPane title="Algemene gegevens">
                                <PhotoSelector
                                    type="organization_logo"
                                    thumbnail={organization?.logo?.sizes?.thumbnail}
                                    selectPhoto={(file) => setMediaFile(file)}
                                />

                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.name')}
                                    error={form.errors.name}
                                    info={translate('organization_edit.tooltips.name')}
                                    input={() => (
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Bedrijfsnaam"
                                            value={form.values?.name || ''}
                                            onChange={(e) => form.update({ name: e.target.value })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.kvk')}
                                    error={form.errors.kvk}
                                    info={translate('organization_edit.tooltips.kvk')}
                                    input={() => (
                                        <input
                                            type="text"
                                            placeholder="KvK-nummer"
                                            className="form-control"
                                            value={form.values?.kvk || ''}
                                            onChange={(e) => form.update({ kvk: e.target.value })}
                                        />
                                    )}
                                />
                            </FormPane>
                            <FormPane title="Financiële gegevens">
                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.bank')}
                                    error={form.errors.iban}
                                    info={translate('organization_edit.tooltips.bank')}
                                    hint={
                                        organization &&
                                        organization?.identity_address != authIdentity.address &&
                                        'Alleen de eigenaar kan het rekeningnummer wijzigen.'
                                    }
                                    input={() => (
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder={'IBAN-nummer'}
                                            value={form.values?.iban || ''}
                                            onChange={(e) => form.update({ iban: e.target.value })}
                                            disabled={
                                                organization && organization?.identity_address != authIdentity.address
                                            }
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={translate('organization_edit.labels.tax')}
                                    error={form.errors.btw}
                                    info={translate('organization_edit.tooltips.btw')}
                                    input={() => (
                                        <input
                                            type="text"
                                            placeholder="BTW-nummer"
                                            className="form-control"
                                            value={form.values?.btw || ''}
                                            onChange={(e) => form.update({ btw: e.target.value })}
                                        />
                                    )}
                                />
                            </FormPane>
                            <FormPane title="Contactgegevens">
                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.mail')}
                                    input={() => (
                                        <div className="row">
                                            <div className="col col-lg-8 col-lg-12">
                                                <FormGroupInfo
                                                    error={form.errors?.email}
                                                    info={<TranslateHtml i18n={'organization_edit.tooltips.email'} />}>
                                                    <input
                                                        id={'email'}
                                                        type="email"
                                                        className="form-control"
                                                        value={form.values?.email || ''}
                                                        onChange={(e) => form.update({ email: e.target.value })}
                                                        placeholder="E-mailadres"
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            <div className="col col-lg-4 col-lg-12">
                                                <CheckboxControl
                                                    id={'email_public'}
                                                    title={'Toon openbaar op website'}
                                                    checked={!!form.values?.email_public}
                                                    onChange={(e) => form.update({ email_public: e.target.checked })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />

                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.phone')}
                                    input={() => (
                                        <div className="row">
                                            <div className="col col-lg-8 col-lg-12">
                                                <FormGroupInfo
                                                    error={form.errors?.phone}
                                                    info={<TranslateHtml i18n={'organization_edit.tooltips.phone'} />}>
                                                    <input
                                                        id="phone"
                                                        type="text"
                                                        className="form-control"
                                                        value={form.values?.phone || ''}
                                                        onChange={(e) => form.update({ phone: e.target.value })}
                                                        placeholder="Telefoonnummer"
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            <div className="col col-lg-4 col-lg-12">
                                                <CheckboxControl
                                                    id={'phone_public'}
                                                    title={'Toon openbaar op website'}
                                                    checked={!!form.values?.phone_public}
                                                    onChange={(e) => form.update({ phone_public: e.target.checked })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />

                                <FormGroup
                                    label={translate('organization_edit.labels.website')}
                                    input={() => (
                                        <div className="row">
                                            <div className="col col-lg-8 col-lg-12">
                                                <FormGroupInfo
                                                    error={form.errors?.website}
                                                    info={
                                                        <TranslateHtml i18n={'organization_edit.tooltips.website'} />
                                                    }>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={form.values?.website || ''}
                                                        onChange={(e) => form.update({ website: e.target.value })}
                                                        placeholder="Website"
                                                    />
                                                </FormGroupInfo>
                                            </div>

                                            <div className="col col-lg-4 col-lg-12">
                                                <CheckboxControl
                                                    id={'website_public'}
                                                    title={'Toon openbaar op website'}
                                                    checked={!!form.values?.website_public}
                                                    onChange={(e) => form.update({ website_public: e.target.checked })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                />
                            </FormPane>
                            <FormPane title="Over de organisatie">
                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.business_type')}
                                    error={form.errors.business_type_id}
                                    info={translate('organization_edit.tooltips.business_type')}
                                    input={() => (
                                        <SelectControl
                                            className={'form-control'}
                                            options={businessTypes || []}
                                            propKey={'id'}
                                            allowSearch={true}
                                            value={form.values?.business_type_id}
                                            optionsComponent={SelectControlOptionsFD}
                                            onChange={(id?: number) => form.update({ business_type_id: id })}
                                        />
                                    )}
                                />

                                <FormGroup
                                    required={true}
                                    label={translate('organization_edit.labels.description')}
                                    error={form.errors.description}
                                    input={() => (
                                        <MarkdownEditor
                                            value={form.values?.description_html || ''}
                                            onChange={(description) => form.update({ description })}
                                            placeholder={translate('organization_edit.labels.description')}
                                        />
                                    )}
                                />
                            </FormPane>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-section">
                <div className="text-center">
                    {organization ? (
                        <StateNavLink
                            name={isProvider ? DashboardRoutes.OFFICES : DashboardRoutes.ORGANIZATIONS}
                            params={{ organizationId: organization.id }}
                            className="button button-default">
                            {translate('organization_edit.buttons.cancel')}
                        </StateNavLink>
                    ) : (
                        <StateNavLink name={DashboardRoutes.ORGANIZATIONS} className="button button-default">
                            {translate('organization_edit.buttons.cancel')}
                        </StateNavLink>
                    )}

                    <button type="submit" className="button button-primary">
                        {translate('organization_edit.buttons.create')}
                    </button>
                </div>
            </div>
        </form>
    );
}
