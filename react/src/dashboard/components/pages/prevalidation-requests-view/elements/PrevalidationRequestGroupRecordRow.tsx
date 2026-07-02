import React, { Fragment, useCallback } from 'react';
import classNames from 'classnames';
import TableRowActions from '../../../elements/tables/TableRowActions';
import PrevalidationRequestRecord from '../../../../props/models/PrevalidationRequestRecord';
import { PrevalidationRequestRecordGroupLocal, PrevalidationRequestRecordLocal } from '../PrevalidationRequestsView';
import useOpenModal from '../../../../hooks/useOpenModal';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import Organization from '../../../../props/models/Organization';
import ModalPrevalidationRequestRecordEdit from '../../../modals/record-edit/ModalPrevalidationRequestRecordEdit';
import useTranslate from '../../../../hooks/useTranslate';
import Tooltip from '../../../elements/tooltip/Tooltip';
import PrevalidationRequestRecordHistory from './PrevalidationRequestRecordHistory';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function PrevalidationRequestGroupRecordRow({
    organization,
    record,
    group,
    uncollapsedRecords,
    setUncollapsedRecords,
    reloadRequest,
    canEditRecord,
}: {
    organization: Organization;
    record: PrevalidationRequestRecordLocal;
    group: PrevalidationRequestRecordGroupLocal;
    uncollapsedRecords: Array<number>;
    setUncollapsedRecords: React.Dispatch<React.SetStateAction<number[]>>;
    reloadRequest: () => void;
    canEditRecord: boolean;
}) {
    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();
    const translate = useTranslate();
    const recordType = record.record_type;
    const recordTypeName = recordType?.name || record.record_type_key;

    const editRecord = useCallback(
        (prevalidationRequestRecord: PrevalidationRequestRecord) => {
            openModal((modal) => (
                <ModalPrevalidationRequestRecordEdit
                    modal={modal}
                    organization={organization}
                    requestRecord={prevalidationRequestRecord}
                    onEdit={() => {
                        pushSuccess('Gelukt!', 'Persoonsgegeven toegevoegd.');
                        reloadRequest();
                    }}
                />
            ));
        },
        [organization, openModal, pushSuccess, reloadRequest],
    );

    return (
        <Fragment>
            <tr
                className={classNames('tr-narrow', record.hasContent && 'tr-clickable')}
                data-dusk={`tablePrevalidationRequestRecordRow${record.id}`}
                id={`recordRow${record.id}`}
                onClick={() => {
                    if (!record.hasContent) {
                        return;
                    }

                    setUncollapsedRecords((shownRecords) => {
                        return shownRecords?.includes(record.id)
                            ? shownRecords?.filter((id) => id !== record.id)
                            : [...shownRecords, record.id];
                    });
                }}>
                {group.hasContent && <td className="td-narrow"></td>}
                <td>
                    <div className="td-collapsable" data-dusk={`prevalidationRequestRecordToggleCollapse${record.id}`}>
                        {record.hasContent && (
                            <div className="collapsable-icon">
                                <div
                                    className={classNames(
                                        `mdi icon-collapse `,
                                        uncollapsedRecords.includes(record.id) ? 'mdi-menu-down' : 'mdi-menu-right',
                                    )}
                                />
                            </div>
                        )}

                        <div className="collapsable-content text-semibold">{recordTypeName}</div>
                    </div>
                </td>

                {recordType?.type != 'select' && (
                    <td className={classNames(record.value !== null && 'text-muted')}>
                        {record?.value || 'Niet beschikbaar'}
                    </td>
                )}

                {recordType?.type == 'select' && (
                    <td className={classNames(record.value !== null && 'text-muted')}>
                        {recordType.options?.find((option) => option.value == record?.value)?.name ||
                            'Niet beschikbaar'}
                    </td>
                )}

                <td>
                    <div className="flex flex-gap-xs">
                        {translate(`prevalidation_requests.sources.${record.source}`)}
                        {record.history.length > 0 && (
                            <Tooltip size="sm" text={translate('prevalidation_requests.details.tooltips.edited')} />
                        )}
                    </div>
                </td>

                <td className="td-narrow text-right">
                    {canEditRecord ? (
                        <TableRowActions
                            dataDusk={`prevalidationRequestRecordMenuBtn${record.id}`}
                            content={(e) => (
                                <div className="dropdown dropdown-actions">
                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            e.close();
                                            editRecord(record);
                                        }}
                                        data-dusk="prevalidationRequestRecordEditBtn">
                                        <em className="mdi mdi-pencil icon-start" />
                                        Bewerking
                                    </div>
                                </div>
                            )}
                        />
                    ) : (
                        <TableEmptyValue />
                    )}
                </td>
            </tr>
            {record.hasContent && uncollapsedRecords.includes(record.id) && (
                <tr className="tr-dim">
                    {group.hasContent && <td className="td-narrow"></td>}
                    <td className="collapse-content" colSpan={7}>
                        <div className="flex flex-vertical flex-gap">
                            <PrevalidationRequestRecordHistory record={record} />
                        </div>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
