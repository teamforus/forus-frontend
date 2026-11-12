import React from 'react';
import { FundRequestProfileCopyPreview as ProfileCopyPreview } from '../../../../props/models/FundRequest';
import useTranslate from '../../../../hooks/useTranslate';
import InfoBox from '../../../elements/info-box/InfoBox';
import Label, { LabelType } from '../../../elements/label/Label';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import LoadingCard from '../../../elements/loading-card/LoadingCard';

const actionLabels: Record<ProfileCopyPreview['records'][number]['action'], LabelType> = {
    add: 'success',
    update: 'primary',
    unchanged: 'default',
    not_copied: 'default',
};

export default function FundRequestProfileCopyPreview({
    enabled,
    loading,
    preview,
}: {
    enabled: boolean;
    loading: boolean;
    preview: ProfileCopyPreview | null;
}) {
    const translate = useTranslate();

    if (!enabled) {
        return (
            <InfoBox>
                <p>{translate('validation_request_details.profile_copy_preview.disabled')}</p>
            </InfoBox>
        );
    }

    if (loading) {
        return <LoadingCard description={translate('validation_request_details.profile_copy_preview.loading')} />;
    }

    if (!preview) {
        return null;
    }

    return (
        <div className="flex flex-vertical flex-gap" data-dusk="fundRequestProfileCopyPreview">
            <InfoBox>
                <p>{translate('validation_request_details.profile_copy_preview.estimate')}</p>

                {preview.profile_id === null && (
                    <p>{translate('validation_request_details.profile_copy_preview.new_profile')}</p>
                )}
            </InfoBox>

            {preview.records.length > 0 ? (
                <div className="approve-request-formula">
                    <div className="approve-request-formula-header">
                        {translate('validation_request_details.profile_copy_preview.title')}
                    </div>

                    <div className="approve-request-formula-body">
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th
                                            title={translate(
                                                'validation_request_details.profile_copy_preview.tooltips.field',
                                            )}>
                                            {translate('validation_request_details.profile_copy_preview.columns.field')}
                                        </th>
                                        <th
                                            title={translate(
                                                'validation_request_details.profile_copy_preview.tooltips.current',
                                            )}>
                                            {translate(
                                                'validation_request_details.profile_copy_preview.columns.current',
                                            )}
                                        </th>
                                        <th
                                            title={translate(
                                                'validation_request_details.profile_copy_preview.tooltips.value',
                                            )}>
                                            {translate('validation_request_details.profile_copy_preview.columns.value')}
                                        </th>
                                        <th
                                            title={translate(
                                                'validation_request_details.profile_copy_preview.tooltips.action',
                                            )}>
                                            {translate(
                                                'validation_request_details.profile_copy_preview.columns.action',
                                            )}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {preview.records.map((record) => {
                                        const action = record.action;
                                        const actionLabel = translate(
                                            `validation_request_details.profile_copy_preview.actions.${action}`,
                                        );

                                        return (
                                            <tr key={record.record_type_key}>
                                                <td>{record.record_type_name}</td>
                                                <td>{record.current_value || <TableEmptyValue />}</td>
                                                <td>{record.application_value || <TableEmptyValue />}</td>
                                                <td>
                                                    <Label type={actionLabels[action]}>{actionLabel}</Label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="approve-request-formula-footer">
                        <div className="approve-request-formula-totals">
                            <div className="label-group">
                                {Object.entries(actionLabels).map(([action, labelType]) => {
                                    const actionLabel = translate(
                                        `validation_request_details.profile_copy_preview.actions.${action}`,
                                    );

                                    return (
                                        <Label key={action} type={labelType}>
                                            {actionLabel}:{' '}
                                            {preview.records.filter((record) => record.action === action).length}
                                        </Label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <InfoBox>
                    <p>{translate('validation_request_details.profile_copy_preview.empty')}</p>
                </InfoBox>
            )}
        </div>
    );
}
