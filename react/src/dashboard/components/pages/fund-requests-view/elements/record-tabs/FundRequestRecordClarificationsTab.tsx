import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React from 'react';
import FundRequestRecordClarificationsTabItem from './FundRequestRecordClarificationsTabItem';
import FundRequestClarification from '../../../../../props/models/FundRequestClarification';

export default function FundRequestRecordClarificationsTab({
    fundRequestRecord,
    editClarification,
    closeClarification,
}: {
    fundRequestRecord: FundRequestRecord;
    editClarification: (clarification: FundRequestClarification) => void;
    closeClarification: (clarification: FundRequestClarification) => void;
}) {
    return (
        <div className="block block-request-clarification" data-dusk="clarificationsTabContent">
            <div className="block-title">Aanvullingen</div>
            {fundRequestRecord.clarifications.map((clarification, index) => (
                <FundRequestRecordClarificationsTabItem
                    index={index}
                    key={clarification.id}
                    clarification={clarification}
                    editClarification={() => editClarification(clarification)}
                    closeClarification={() => closeClarification(clarification)}
                />
            ))}
        </div>
    );
}
