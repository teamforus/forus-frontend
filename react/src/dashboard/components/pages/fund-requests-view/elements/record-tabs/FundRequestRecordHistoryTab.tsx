import FundRequestRecord from '../../../../../props/models/FundRequestRecord';
import React from 'react';
import { useFundRequestValidatorService } from '../../../../../services/FundRequestValidatorService';
import RecordHistoryCard from '../../../../elements/record-history/RecordHistoryCard';

export default function FundRequestRecordHistoryTab({ record }: { record: FundRequestRecord }) {
    const fundRequestService = useFundRequestValidatorService();

    return <RecordHistoryCard record={record} columns={fundRequestService.getRecordChangesColumns()} />;
}
