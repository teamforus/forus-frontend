import React, { useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { ResponseError } from '../../props/ApiResponses';
import FundRequest from '../../props/models/FundRequest';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import Organization from '../../props/models/Organization';
import FundRequestRecord from '../../props/models/FundRequestRecord';
import ModalRecordEditBase from './record-edit/ModalRecordEditBase';

export default function ModalFundRequestRecordEdit({
    modal,
    onEdit,
    className,
    fundRequest,
    organization,
    fundRequestRecord,
}: {
    modal: ModalState;
    onEdit: (res?: ResponseError) => void;
    className?: string;
    fundRequest: FundRequest;
    organization: Organization;
    fundRequestRecord: FundRequestRecord;
}) {
    const fundRequestService = useFundRequestValidatorService();

    const criterion = useMemo(
        () => fundRequest?.fund?.criteria?.find((criterion) => criterion.id == fundRequestRecord.fund_criterion_id),
        [fundRequest?.fund?.criteria, fundRequestRecord.fund_criterion_id],
    );

    return (
        <ModalRecordEditBase
            modal={modal}
            onEdit={onEdit}
            className={className}
            dataDusk="modalFundRequestRecordEdit"
            recordTypeKey={fundRequestRecord.record_type_key}
            hint={criterion?.description}
            initialValue={
                fundRequestRecord.record_type.type == 'number'
                    ? parseFloat(fundRequestRecord.value)
                    : fundRequestRecord.value
            }
            recordType={fundRequestRecord.record_type}
            onSubmit={(values) =>
                fundRequestService.updateRecord(
                    organization.id,
                    fundRequestRecord.fund_request_id,
                    fundRequestRecord.id,
                    values,
                )
            }
        />
    );
}
