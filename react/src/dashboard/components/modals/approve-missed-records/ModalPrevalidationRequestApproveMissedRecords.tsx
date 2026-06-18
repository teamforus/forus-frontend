import React from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useTranslate from '../../../hooks/useTranslate';
import ModalApproveMissedRecordsBase from './ModalApproveMissedRecordsBase';

export default function ModalPrevalidationRequestApproveMissedRecords({
    modal,
    onSubmit,
}: {
    modal: ModalState;
    onSubmit: ({ note }: { note: string }) => void;
}) {
    const translate = useTranslate();

    return (
        <ModalApproveMissedRecordsBase
            modal={modal}
            onSubmit={onSubmit}
            title={translate('modals.modal_prevalidation_request_approve_missed_records.title')}
            description={translate('modals.modal_prevalidation_request_approve_missed_records.description')}
            noteLabel={translate('modals.modal_prevalidation_request_approve_missed_records.labels.note')}
            noteHint={translate('modals.modal_prevalidation_request_approve_missed_records.hints.note')}
            notePlaceholder={translate('modals.modal_prevalidation_request_approve_missed_records.placeholders.note')}
            approveLabel={translate('modals.modal_prevalidation_request_approve_missed_records.labels.approve')}
        />
    );
}
