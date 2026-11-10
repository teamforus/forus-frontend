import React, { useCallback } from 'react';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import ModalEditProfileRecords from '../modals/ModalEditProfileRecords';
import useOpenModal from '../../../../hooks/useOpenModal';
import RecordType from '../../../../props/models/RecordType';
import Organization from '../../../../props/models/Organization';

export default function useEditProfileRecords(organization: Organization, recordTypes: RecordType<string>[]) {
    const openModal = useOpenModal();

    return useCallback(
        (
            identity: SponsorIdentity | null,
            title: string,
            onDone: () => void,
            keys?: string[],
            selectRecord = false,
        ) => {
            openModal((modal) => (
                <ModalEditProfileRecords
                    modal={modal}
                    title={title}
                    identity={identity}
                    organization={organization}
                    recordTypes={recordTypes.filter((type) => !keys || keys.includes(type.key))}
                    selectRecord={selectRecord}
                    onDone={onDone}
                />
            ));
        },
        [openModal, organization, recordTypes],
    );
}
