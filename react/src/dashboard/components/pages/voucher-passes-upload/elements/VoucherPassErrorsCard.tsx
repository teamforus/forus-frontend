import React, { ReactNode } from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import { VoucherPassCsvError } from '../types';
import useVoucherPassPagination from '../hooks/useVoucherPassPagination';
import Card from '../../../elements/card/Card';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Paginator from '../../../../modules/paginator/components/Paginator';

export default function VoucherPassErrorsCard({
    errors,
    footer,
}: {
    errors: VoucherPassCsvError[];
    footer: ReactNode;
}) {
    const translate = useTranslate();

    const { meta, filterValues, filterUpdate } = useVoucherPassPagination(errors.length, 'voucher_pass_errors');

    return (
        <Card title={translate('voucher_passes.upload.errors')} section={false} footerType="primary" footer={footer}>
            <LoaderTableCard
                tableOptions={{ hasTooltips: false }}
                columns={[
                    { key: 'row', label: 'voucher_passes.upload.row_number' },
                    { key: 'column', label: 'voucher_passes.upload.column' },
                    { key: 'message', label: 'voucher_passes.upload.message' },
                ]}>
                {errors.slice(meta.from - 1, meta.to).map((error, index) => (
                    <tr key={index} className="tr-narrow">
                        <td>{error.row || <TableEmptyValue />}</td>
                        <td>{error.column || <TableEmptyValue />}</td>
                        <td>{error.message}</td>
                    </tr>
                ))}
            </LoaderTableCard>

            <div className="card-section">
                <Paginator
                    meta={meta}
                    filters={filterValues}
                    updateFilters={filterUpdate}
                    perPageKey="voucher_pass_errors"
                />
            </div>
        </Card>
    );
}
