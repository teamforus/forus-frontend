import React, { Fragment } from 'react';
import classNames from 'classnames';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import { PrevalidationRequestRecordGroupLocal, PrevalidationRequestRecordLocal } from '../PrevalidationRequestsView';
import Organization from '../../../../props/models/Organization';
import PrevalidationRequestGroupRecordRow from './PrevalidationRequestGroupRecordRow';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import { usePrevalidationRequestService } from '../../../../services/PrevalidationRequestService';

export default function PrevalidationRequestRecordGroupRow({
    organization,
    group,
    uncollapsedRecords,
    setUncollapsedRecords,
    uncollapsedRecordGroups,
    setUncollapsedRecordGroups,
    reloadRequest,
    canEditRecord,
}: {
    organization: Organization;
    group: PrevalidationRequestRecordGroupLocal;
    uncollapsedRecordGroups: Array<number>;
    setUncollapsedRecordGroups: React.Dispatch<React.SetStateAction<number[]>>;
    uncollapsedRecords: Array<number>;
    setUncollapsedRecords: React.Dispatch<React.SetStateAction<number[]>>;
    reloadRequest: () => void;
    canEditRecord: boolean;
}) {
    const prevalidationRequestService = usePrevalidationRequestService();

    const { headElement, configsElement } = useConfigurableTable(prevalidationRequestService.getRecordsColumns(), {
        trPrepend: <Fragment>{group?.hasContent && <th className="th-narrow" />}</Fragment>,
    });

    return (
        <Fragment>
            <tr
                className="tr-clickable"
                data-dusk={`tablePrevalidationRequestRecordGroupRow${group.id}`}
                onClick={() => {
                    setUncollapsedRecordGroups((groups) => {
                        return groups?.includes(group.id)
                            ? groups?.filter((id) => id !== group.id)
                            : [...groups, group.id];
                    });
                }}>
                <td>
                    <div className="td-collapsable td-collapsable-lg">
                        <div className="collapsable-icon">
                            <div
                                className={classNames(
                                    'mdi',
                                    'icon-collapse',
                                    uncollapsedRecordGroups.includes(group.id) ? 'mdi-menu-down' : 'mdi-menu-right',
                                )}
                            />
                        </div>

                        <div className="collapsable-content text-semibold">
                            {group.title} ({group.records.length})
                        </div>
                    </div>
                </td>
                <td className="td-narrow text-right">
                    <TableEmptyValue />
                </td>
            </tr>

            {uncollapsedRecordGroups.includes(group.id) && (
                <tr>
                    <td className="td-paddless relative" colSpan={3}>
                        {configsElement}

                        <table className="table table-embed">
                            {headElement}

                            <tbody>
                                <Fragment>
                                    {group.records.map((record: PrevalidationRequestRecordLocal) => (
                                        <PrevalidationRequestGroupRecordRow
                                            key={record.id}
                                            organization={organization}
                                            record={record}
                                            group={group}
                                            uncollapsedRecords={uncollapsedRecords}
                                            setUncollapsedRecords={setUncollapsedRecords}
                                            reloadRequest={reloadRequest}
                                            canEditRecord={canEditRecord}
                                        />
                                    ))}
                                </Fragment>
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
