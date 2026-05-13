import React, { useState } from 'react';
import useOfficeService from '../../../../services/OfficeService';
import { OfficeLocal } from '../Offices';
import useConfigurableTable from '../../vouchers/hooks/useConfigurableTable';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';

export default function OfficeScheduleTable({ office }: { office: OfficeLocal }) {
    const officeService = useOfficeService();

    const [weekDays] = useState(officeService.scheduleWeekDaysExplicit());
    const { headElement, configsElement } = useConfigurableTable(officeService.getScheduleColumns());

    return (
        <tr>
            <td className="td-paddless relative" colSpan={6}>
                {configsElement}

                <table className="table table-embed">
                    {headElement}

                    <tbody>
                        {Object.keys(weekDays)?.map((weekDayKey) => (
                            <tr key={weekDayKey}>
                                <td>{weekDays[weekDayKey]}</td>
                                <td>{office.scheduleByDay[weekDayKey]?.start_time || <TableEmptyValue />}</td>
                                <td>{office.scheduleByDay[weekDayKey]?.end_time || <TableEmptyValue />}</td>
                                <td className={'table-td-actions text-right'}>
                                    <TableEmptyValue />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </td>
        </tr>
    );
}
