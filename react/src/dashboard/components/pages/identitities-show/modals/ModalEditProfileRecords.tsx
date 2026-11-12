import React, { useMemo, useState } from 'react';
import { ModalState } from '../../../../modules/modals/context/ModalContext';
import Organization from '../../../../props/models/Organization';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import RecordType from '../../../../props/models/RecordType';
import useTranslate from '../../../../hooks/useTranslate';
import useSetProgress from '../../../../hooks/useSetProgress';
import usePushApiError from '../../../../hooks/usePushApiError';
import useFormBuilder from '../../../../hooks/useFormBuilder';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import { ResponseError } from '../../../../props/ApiResponses';
import Modal from '../../../modals/elements/Modal';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../elements/select-control/SelectControl';
import ProfileRecordGroupFields from './elements/ProfileRecordGroupFields';
import useProfileRecordGroups from '../hooks/useProfileRecordGroups';
import mapProfileRecordErrors from '../helpers/mapProfileRecordErrors';
import isEditableProfileRecordType from '../helpers/isEditableProfileRecordType';

export default function ModalEditProfileRecords({
    modal,
    title,
    organization,
    recordTypes,
    identity,
    selectRecord = false,
    onDone,
}: {
    modal: ModalState;
    title: string;
    organization: Organization;
    recordTypes: RecordType<string>[];
    identity?: SponsorIdentity;
    selectRecord?: boolean;
    onDone: () => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const service = useSponsorIdentitiesService();

    const [selectedKey, setSelectedKey] = useState(recordTypes[0]?.key || '');

    const editableTypes = useMemo(() => {
        return recordTypes.filter(
            (type) => isEditableProfileRecordType(type, organization.id) && (!selectRecord || type.key === selectedKey),
        );
    }, [organization.id, recordTypes, selectRecord, selectedKey]);

    const groups = useProfileRecordGroups(editableTypes, organization.id);

    const form = useFormBuilder<Record<string, string | null>>(
        Object.fromEntries(
            editableTypes
                .filter((type) => identity?.records?.[type.key]?.length)
                .map((type) => [type.key, identity.records[type.key][0].value]),
        ),
        (values) => {
            const records = editableTypes
                .filter((type) => Object.hasOwn(values, type.key))
                .map((type) => ({ record_type_key: type.key, value: values[type.key] }));

            setProgress(0);
            modal.setProcessing(true);

            const request = identity
                ? service.update(organization.id, identity.id, { records })
                : service.store(organization.id, { records });

            request
                .then(() => {
                    onDone();
                    modal.setProcessing(false);
                    modal.close();
                })
                .catch((error: ResponseError) => {
                    form.setErrors(mapProfileRecordErrors(error.data?.errors, records));
                    pushApiError(error);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                    modal.setProcessing(false);
                });
        },
    );

    return (
        <Modal
            modal={modal}
            title={title}
            onSubmit={form.submit}
            footer={
                <div className="button-group">
                    <button type="button" className="button button-default" onClick={modal.close}>
                        {translate('identities.custom_records.cancel')}
                    </button>
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={form.isLocked || (!!identity && !editableTypes.length)}>
                        {translate('identities.custom_records.save')}
                    </button>
                </div>
            }>
            {selectRecord && (
                <FormGroup
                    label={translate('identities.custom_records.record')}
                    input={(id) => (
                        <SelectControl
                            id={id}
                            propKey="key"
                            propValue="name"
                            value={selectedKey}
                            options={recordTypes}
                            onChange={(key: string) => setSelectedKey(key)}
                        />
                    )}
                />
            )}

            <ProfileRecordGroupFields groups={groups} form={form} showGroupPanes={!selectRecord} />
        </Modal>
    );
}
