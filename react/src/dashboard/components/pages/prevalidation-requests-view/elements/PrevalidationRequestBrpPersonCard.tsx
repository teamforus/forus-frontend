import React, { useCallback } from 'react';
import Organization from '../../../../props/models/Organization';
import PrevalidationRequest from '../../../../props/models/PrevalidationRequest';
import { usePrevalidationRequestService } from '../../../../services/PrevalidationRequestService';
import BrpPersonCard from '../../../elements/brp-person/BrpPersonCard';

export default function PrevalidationRequestBrpPersonCard({
    request,
    organization,
}: {
    request: PrevalidationRequest;
    organization: Organization;
}) {
    const prevalidationRequestService = usePrevalidationRequestService();

    const fetchPerson = useCallback(
        (data: object = {}) => prevalidationRequestService.getPersonBsn(organization.id, request.id, data),
        [prevalidationRequestService, organization.id, request.id],
    );

    return <BrpPersonCard fetchPerson={fetchPerson} />;
}
