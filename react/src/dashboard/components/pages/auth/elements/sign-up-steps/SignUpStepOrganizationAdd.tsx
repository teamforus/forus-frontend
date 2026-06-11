import React, { useCallback, useEffect, useState } from 'react';
import UIControlText from '../../../../elements/forms/ui-controls/UIControlText';
import PhotoSelector from '../../../../elements/photo-selector/PhotoSelector';
import UIControlCheckbox from '../../../../elements/forms/ui-controls/UIControlCheckbox';
import SelectControl from '../../../../elements/select-control/SelectControl';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../../props/ApiResponses';
import BusinessType from '../../../../../props/models/BusinessType';
import Organization from '../../../../../props/models/Organization';
import { useOrganizationService } from '../../../../../services/OrganizationService';
import { useMediaService } from '../../../../../services/MediaService';
import ProgressStorage from '../../../../../helpers/ProgressStorage';
import { useBusinessTypeService } from '../../../../../services/BusinessTypeService';
import useTranslate from '../../../../../hooks/useTranslate';
import SignUpFooter from '../../../../../../webshop/components/elements/sign-up/SignUpFooter';
import FormGroupInfo from '../../../../elements/forms/elements/FormGroupInfo';
import FormGroup from '../../../../elements/forms/elements/FormGroup';

export default function SignUpStepOrganizationAdd({
    panelType,
    onOrganizationSelect,
    onCancelAddOrganization,
}: {
    panelType: 'sponsor' | 'validator';
    onOrganizationSelect: (organization: Organization) => void;
    onCancelAddOrganization: () => void;
}) {
    const translate = useTranslate();
    const mediaService = useMediaService();
    const organizationService = useOrganizationService();
    const businessTypeService = useBusinessTypeService();

    const [orgMediaFile, setOrgMediaFile] = useState(null);
    const [businessTypes, setBusinessTypes] = useState<Array<BusinessType>>(null);
    const [progressStorage] = useState(new ProgressStorage(`${panelType}-sign_up`));

    const formOrganization = useFormBuilder(
        {
            name: '',
            kvk: '',
            btw: '',
            email: '',
            email_public: false,
            phone: '',
            phone_public: false,
            website: 'https://',
            website_public: false,
            iban: '',
            iban_confirmation: '',
            business_type_id: null,
            media_uid: null,
        },
        async (values) => {
            if (values && values.iban != values.iban_confirmation) {
                formOrganization.setIsLocked(false);
                formOrganization.setErrors({ iban_confirmation: [translate('validation.iban_confirmation')] });
                return;
            }

            const data = JSON.parse(JSON.stringify(values));

            if (typeof data.iban === 'string') {
                data.iban = data.iban.replace(/\s/g, '');
            }

            const submit = () => {
                return organizationService
                    .store(data)
                    .then((res) => onOrganizationSelect(res.data.data))
                    .catch((err: ResponseError) => {
                        formOrganization.setErrors(err.data.errors);
                        formOrganization.setIsLocked(false);
                    });
            };

            if (orgMediaFile) {
                await mediaService.store('organization_logo', orgMediaFile).then((res) => {
                    formOrganization.update({ media_uid: res.data.data.uid });
                    Object.assign(data, { media_uid: res.data.data.uid });
                    setOrgMediaFile(null);
                });
            }

            return submit();
        },
    );

    const formOrganizationUpdate = formOrganization.update;

    const selectPhoto = useCallback((file: File | Blob) => {
        setOrgMediaFile(file);
    }, []);

    const cancelAddOrganization = useCallback(() => {
        onCancelAddOrganization();
    }, [onCancelAddOrganization]);

    const fetchBusinessTypes = useCallback(() => {
        businessTypeService.list({ per_page: 9999 }).then((res) => {
            setBusinessTypes(res.data.data);
        });
    }, [businessTypeService]);

    useEffect(() => {
        fetchBusinessTypes();
    }, [fetchBusinessTypes]);

    useEffect(() => {
        if (progressStorage.has('organizationForm')) {
            formOrganizationUpdate(JSON.parse(progressStorage.get('organizationForm')));
        }
    }, [formOrganizationUpdate, progressStorage]);

    return (
        <div className="sign_up-pane">
            <form
                className="form"
                onSubmit={(e) => {
                    e?.preventDefault();
                    formOrganization.submit();
                }}>
                <div className="sign_up-pane-header">
                    {translate(`sign_up_${panelType}.header.title_step_${panelType == 'sponsor' ? 4 : 5}`)}
                </div>
                <div className="sign_up-pane-body">
                    <div className="sign_up-pane-text">
                        {translate(`sign_up_${panelType}.header.subtitle_step_${panelType == 'sponsor' ? 4 : 5}`)}
                    </div>
                </div>
                <div className="sign_up-pane-body sign_up-pane-body-padless">
                    <div className="sign_up-pane-section">
                        <div className="sign_up-pane-col sign_up-pane-col-2">
                            <FormGroup
                                label={translate('organization_edit.labels.name')}
                                error={formOrganization.errors.name}
                                info={translate('organization_edit.tooltips.name')}
                                input={() => (
                                    <UIControlText
                                        value={formOrganization.values.name}
                                        onChange={(e) => formOrganization.update({ name: e.target.value })}
                                        placeholder={'Bedrijfsnaam'}
                                        autoComplete={'organization'}
                                    />
                                )}
                            />

                            <FormGroup
                                label={translate('organization_edit.labels.bank')}
                                error={formOrganization.errors.iban}
                                info={translate('organization_edit.tooltips.bank')}
                                input={() => (
                                    <UIControlText
                                        value={formOrganization.values.iban}
                                        onChange={(e) => formOrganization.update({ iban: e.target.value })}
                                        placeholder={'Voorbeeld: NL123456789B01'}
                                    />
                                )}
                            />

                            <FormGroup
                                label={translate('organization_edit.labels.iban_confirmation')}
                                error={formOrganization.errors.iban_confirmation}
                                info={translate('organization_edit.tooltips.iban_confirmation')}
                                input={() => (
                                    <UIControlText
                                        value={formOrganization.values.iban_confirmation}
                                        onChange={(e) => formOrganization.update({ iban_confirmation: e.target.value })}
                                        placeholder={'Voorbeeld: NL123456789B01'}
                                    />
                                )}
                            />
                        </div>
                        <div className="sign_up-pane-col sign_up-pane-col-1">
                            <PhotoSelector
                                type={'organization_logo'}
                                template="photo-selector-sign_up"
                                selectPhoto={selectPhoto}
                                description={translate('organization_edit.labels.photo_description')}
                            />
                        </div>
                    </div>
                </div>
                <div className="sign_up-pane-body sign_up-pane-body-padless">
                    <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                        <div className="sign_up-pane-col">
                            <FormGroup
                                label={translate('organization_edit.labels.mail')}
                                input={() => (
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <FormGroupInfo
                                                error={formOrganization.errors.email}
                                                info={translate('organization_edit.tooltips.email')}>
                                                <UIControlText
                                                    value={formOrganization.values.email}
                                                    onChange={(e) => formOrganization.update({ email: e.target.value })}
                                                    placeholder={'E-mailadres'}
                                                    autoComplete={'email'}
                                                />
                                            </FormGroupInfo>
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'email_public_input'}
                                                name="email_public"
                                                className="make-public"
                                                label={translate('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.email_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        email_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            />

                            <FormGroup
                                label={translate('organization_edit.labels.phone')}
                                input={() => (
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <FormGroupInfo
                                                error={formOrganization.errors.phone}
                                                info={translate('organization_edit.tooltips.phone')}>
                                                <UIControlText
                                                    value={formOrganization.values.phone}
                                                    onChange={(e) => formOrganization.update({ phone: e.target.value })}
                                                    placeholder={'Telefoonnummer'}
                                                    autoComplete={'tel'}
                                                />
                                            </FormGroupInfo>
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'phone_public_input'}
                                                name="phone_public"
                                                className="make-public"
                                                label={translate('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.phone_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        phone_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            />

                            <FormGroup
                                label={translate('organization_edit.labels.website')}
                                input={() => (
                                    <div className="row">
                                        <div className="col col-md-8 col-xs-12">
                                            <FormGroupInfo
                                                error={formOrganization.errors.website}
                                                info={translate('organization_edit.tooltips.website')}>
                                                <UIControlText
                                                    value={formOrganization.values.website}
                                                    onChange={(e) =>
                                                        formOrganization.update({ website: e.target.value })
                                                    }
                                                    placeholder={'Website'}
                                                    autoComplete={'url'}
                                                />
                                            </FormGroupInfo>
                                        </div>
                                        <div className="col col-md-4 col-xs-12">
                                            <UIControlCheckbox
                                                id={'website_public_input'}
                                                name="website_public"
                                                className="make-public"
                                                label={translate('organization_edit.labels.make_public')}
                                                checked={formOrganization.values.website_public}
                                                onChange={(e) =>
                                                    formOrganization.update({
                                                        website_public: e.target.checked,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <div className="sign_up-pane-body sign_up-pane-body-padless">
                    <div className="sign_up-pane-section" style={{ paddingRight: '30px' }}>
                        <div className="sign_up-pane-col">
                            <div className="row">
                                <div className="col col-md-8 col-xs-12">
                                    <FormGroup
                                        label={translate('organization_edit.labels.business_type')}
                                        error={formOrganization.errors.business_type_id}
                                        info={translate('organization_edit.tooltips.business_type')}
                                        input={() => (
                                            <SelectControl
                                                value={formOrganization.values.business_type_id}
                                                propKey={'id'}
                                                allowSearch={true}
                                                onChange={(business_type_id?: number) =>
                                                    formOrganization.update({ business_type_id })
                                                }
                                                options={businessTypes || []}
                                                placeholder={'Selecteer organisatie type...'}
                                            />
                                        )}
                                    />

                                    <FormGroup
                                        label={translate('organization_edit.labels.kvk')}
                                        error={formOrganization.errors.kvk}
                                        info={translate('organization_edit.tooltips.kvk')}
                                        input={() => (
                                            <UIControlText
                                                value={formOrganization.values.kvk}
                                                onChange={(e) => formOrganization.update({ kvk: e.target.value })}
                                                placeholder={'KvK-nummer'}
                                            />
                                        )}
                                    />

                                    <FormGroup
                                        label={translate('organization_edit.labels.tax')}
                                        error={formOrganization.errors.btw}
                                        info={translate('organization_edit.tooltips.btw')}
                                        hint={translate('organization_edit.labels.optional')}
                                        input={() => (
                                            <UIControlText
                                                value={formOrganization.values.btw}
                                                onChange={(e) => formOrganization.update({ btw: e.target.value })}
                                                placeholder={'BTW-nummer'}
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SignUpFooter
                    startActions={
                        <button
                            type={'button'}
                            className="button button-text button-text-padless"
                            onClick={cancelAddOrganization}
                            tabIndex={0}>
                            <em className="mdi mdi-chevron-left icon-left" />
                            {translate(`sign_up_${panelType}.buttons.back`)}
                        </button>
                    }
                    endActions={
                        <button type={'submit'} className="button button-text button-text-padless">
                            {translate(`sign_up_${panelType}.buttons.next`)}
                            <em className="mdi mdi-chevron-right icon-right" />
                        </button>
                    }
                />
            </form>
        </div>
    );
}
