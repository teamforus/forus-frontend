import React, { useCallback, useMemo, useState } from 'react';
import FundRequest from '../../../props/models/FundRequest';
import FundRequestClarification from '../../../props/models/FundRequestClarification';
import Label, { LabelType } from '../label/Label';
import useTranslate from '../../../hooks/useTranslate';

export default function FundRequestStateLabel({ fundRequest }: { fundRequest: FundRequest }) {
    const translate = useTranslate();

    const [stateLabels] = useState<Record<string, { type: LabelType; icon: string }>>({
        pending: { type: 'primary-light', icon: 'circle-outline' },
        declined: { type: 'danger', icon: 'circle-off-outline' },
        approved: { type: 'success', icon: 'circle-slice-8' },
        approved_partly: { type: 'success', icon: 'circle-slice-4' },
        disregarded: { type: 'default', icon: 'circle-outline' },
        assigned: { type: 'primary', icon: 'circle-outline' },
        expired: { type: 'default', icon: 'circle-outline' },
        clarification_requested: { type: 'warning', icon: 'circle-outline' },
    });

    const hasPendingClarifications = useCallback((clarifications: Array<FundRequestClarification>) => {
        return clarifications.filter((clarification) => clarification.state == 'pending').length;
    }, []);

    const hasRecordsWithPendingClarifications = useMemo(() => {
        return fundRequest.records
            .map((record) => record.clarifications)
            .filter((clarifications) => hasPendingClarifications(clarifications)).length;
    }, [fundRequest.records, hasPendingClarifications]);

    const localState = useMemo(() => {
        if (fundRequest.expired) {
            return { key: 'expired', label: translate('validation_requests.states.expired') };
        }

        if (fundRequest.state == 'pending' && fundRequest.employee) {
            return hasRecordsWithPendingClarifications
                ? {
                      key: 'clarification_requested',
                      label: translate('validation_requests.states.clarification_requested'),
                  }
                : { key: 'assigned', label: translate('validation_requests.states.assigned') };
        }

        return {
            key: fundRequest.state,
            label:
                !fundRequest.employee && fundRequest.state == 'pending'
                    ? translate('validation_requests.states.waiting_assign')
                    : fundRequest.state_locale,
        };
    }, [fundRequest, hasRecordsWithPendingClarifications, translate]);

    return (
        <Label type={stateLabels[localState.key]?.type} icon={stateLabels[localState.key]?.icon}>
            {localState.label}
        </Label>
    );
}
