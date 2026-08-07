import React from 'react';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import useTranslate from '../../../hooks/useTranslate';
import Label from '../label/Label';
import PrevalidationRequest from '../../../props/models/PrevalidationRequest';

export default function PrevalidationRequestStateLabels({ request }: { request: PrevalidationRequest }) {
    const translate = useTranslate();

    if (request.state === 'success') {
        return (
            <Label type="success" dusk="successLabel">
                {translate(`prevalidation_requests.states.${request.state}`)}
            </Label>
        );
    }

    if (request.state === 'pending') {
        return <Label type="default">{translate(`prevalidation_requests.states.${request.state}`)}</Label>;
    }

    if (request.state === 'fail') {
        return <Label type="danger">{translate(`prevalidation_requests.states.${request.state}`)}</Label>;
    }

    if (request.state === 'missing_records') {
        return <Label type="warning">{translate(`prevalidation_requests.states.${request.state}`)}</Label>;
    }

    return <TableEmptyValue />;
}
