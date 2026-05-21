import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import PrevalidationRequest from '../../../../props/models/PrevalidationRequest';
import { strLimit } from '../../../../helpers/string';
import EmptyValue from '../../../elements/empty-value/EmptyValue';
import RequestMissedRecords from '../../fund-requests-view/elements/RequestMissedRecords';
import useRequestMissedRecords from '../../../../hooks/useRequestMissedRecords';

export default function PrevalidationRequestOverviewPane({ request }: { request: PrevalidationRequest }) {
    const translate = useTranslate();

    const { hasWarningMissedRecords, hasInfoMissedRecords } = useRequestMissedRecords(request);

    return (
        <div className="card-section">
            <div className="card-block card-block-keyvalue">
                <KeyValueItem label={translate('prevalidation_requests.labels.bsn')}>{request.bsn}</KeyValueItem>
                <KeyValueItem label={translate('prevalidation_requests.labels.fund')}>
                    {request.fund ? strLimit(request.fund?.name, 32) : <EmptyValue />}
                </KeyValueItem>
                <KeyValueItem label={translate('prevalidation_requests.labels.implementation')}>
                    {request.fund ? strLimit(request.fund?.implementation?.name, 32) : <EmptyValue />}
                </KeyValueItem>
                <KeyValueItem label={translate('prevalidation_requests.labels.employee')}>
                    {request.employee?.email || 'Onbekend'}
                </KeyValueItem>
                <KeyValueItem label={translate('prevalidation_requests.labels.failed_reason')}>
                    {request.state === 'fail' && request.failed_reason ? request.failed_reason_locale : <EmptyValue />}
                </KeyValueItem>

                {(hasWarningMissedRecords || hasInfoMissedRecords) && <RequestMissedRecords request={request} />}
            </div>
        </div>
    );
}
