import React, { Fragment } from 'react';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import InfoBox from '../../../elements/info-box/InfoBox';
import FundRequest from '../../../../props/models/FundRequest';
import useTranslate from '../../../../hooks/useTranslate';
import useRequestMissedRecords from '../../../../hooks/useRequestMissedRecords';
import FundRequestMissedRecordSection from './FundRequestMissedRecordSection';
import PrevalidationRequest from '../../../../props/models/PrevalidationRequest';

export default function RequestMissedRecords({ request }: { request: FundRequest | PrevalidationRequest }) {
    const translate = useTranslate();

    const { infoMissedRecords, warningMissedRecords, warningMissedRecordsPerChild, infoMissedRecordsPerChild } =
        useRequestMissedRecords(request);

    return (
        <Fragment>
            {request?.missed_records.length > 0 && (
                <KeyValueItem dataDusk="missedRecords" label={translate('validation_requests.labels.warning')}>
                    <div className="flex flex-gap flex-vertical flex-grow">
                        {Object.keys(warningMissedRecords).length > 0 && (
                            <InfoBox
                                type={request.missing_records_approved ? 'default' : 'danger'}
                                borderType="dashed"
                                iconType="warning"
                                iconColor="default">
                                <FundRequestMissedRecordSection
                                    type="warning"
                                    records={warningMissedRecords}
                                    recordsPerChild={warningMissedRecordsPerChild}
                                />
                            </InfoBox>
                        )}

                        {Object.keys(infoMissedRecords).length > 0 && (
                            <InfoBox type="primary" borderType="dashed">
                                <FundRequestMissedRecordSection
                                    type="info"
                                    records={infoMissedRecords}
                                    recordsPerChild={infoMissedRecordsPerChild}
                                />
                            </InfoBox>
                        )}
                    </div>
                </KeyValueItem>
            )}
        </Fragment>
    );
}
