import React from 'react';
import { usePrevalidationRequestService } from '../../../../services/PrevalidationRequestService';
import PrevalidationRequestRecord from '../../../../props/models/PrevalidationRequestRecord';
import RecordHistoryCard from '../../../elements/record-history/RecordHistoryCard';

export default function PrevalidationRequestRecordHistory({ record }: { record: PrevalidationRequestRecord }) {
    const prevalidationRequestService = usePrevalidationRequestService();

    return <RecordHistoryCard record={record} columns={prevalidationRequestService.getRecordChangesColumns()} />;
}
