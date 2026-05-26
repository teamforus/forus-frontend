import React from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import { ResponseError } from '../../../props/ApiResponses';
import { usePrevalidationRequestService } from '../../../services/PrevalidationRequestService';
import Organization from '../../../props/models/Organization';
import PrevalidationRequestRecord from '../../../props/models/PrevalidationRequestRecord';
import ModalRecordEditBase from './ModalRecordEditBase';

export default function ModalPrevalidationRequestRecordEdit({
    modal,
    onEdit,
    organization,
    requestRecord,
}: {
    modal: ModalState;
    onEdit: (res?: ResponseError) => void;
    organization: Organization;
    requestRecord: PrevalidationRequestRecord;
}) {
    const prevalidationRequestService = usePrevalidationRequestService();

    return (
        <ModalRecordEditBase
            modal={modal}
            onEdit={onEdit}
            dataDusk="modalPrevalidationRequestRecordEdit"
            recordTypeKey={requestRecord.record_type_key}
            initialValue={requestRecord.value ?? ''}
            recordType={requestRecord.record_type}
            onSubmit={(values) =>
                prevalidationRequestService.updateRecord(
                    organization.id,
                    requestRecord.prevalidation_request_id,
                    requestRecord.id,
                    values,
                )
            }
        />
    );
}
