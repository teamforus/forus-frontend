import React, { ReactNode, useState } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import InfoBox from '../../../elements/info-box/InfoBox';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import { ConfigurableTableColumn } from '../../vouchers/hooks/useConfigurableTable';
import { RequesterImportCsvError } from '../types';
import Paginator from '../../../../modules/paginator/components/Paginator';
import useRequesterImportPagination from '../../requester-imports/hooks/useRequesterImportPagination';

const columns: ConfigurableTableColumn[] = [
    { key: 'row', label: 'requester_imports.labels.row' },
    { key: 'column', label: 'requester_imports.labels.column' },
    { key: 'error', label: 'requester_imports.labels.error' },
];

export default function RequesterImportErrorsCard({
    errors,
    footer,
}: {
    errors: RequesterImportCsvError[];
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const [paginatorKey] = useState('requester_import_errors');

    const { meta, filterValues, filterUpdate } = useRequesterImportPagination(errors.length, paginatorKey);

    return (
        <Card
            title={translate('requester_imports.upload.validation_errors')}
            section={false}
            footerType="primary"
            footer={footer}>
            <div className="card-section">
                <InfoBox type="danger" iconType="warning" iconColor="warning">
                    <p>{translate('requester_imports.upload.correct_errors')}</p>
                </InfoBox>
            </div>

            <LoaderTableCard columns={columns} tableOptions={{ hasTooltips: false }}>
                {errors.slice(meta.from - 1, meta.to).map((error, index) => (
                    <tr key={index} className="tr-narrow">
                        <td>{error.row || <TableEmptyValue />}</td>
                        <td>{error.column || <TableEmptyValue />}</td>
                        <td className="text-white-space-normal">{error.message}</td>
                    </tr>
                ))}
            </LoaderTableCard>

            <div className="card-section">
                <Paginator meta={meta} filters={filterValues} updateFilters={filterUpdate} perPageKey={paginatorKey} />
            </div>
        </Card>
    );
}
