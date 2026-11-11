import React, { useCallback, useEffect, useState } from 'react';
import { NumberParam, StringParam } from 'use-query-params';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageVoucherPasses from '../../../hooks/permissions/useCanManageVoucherPasses';
import useTranslate from '../../../hooks/useTranslate';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushApiError from '../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { useVoucherPassService } from '../../../services/VoucherPassService';
import VoucherPass from '../../../props/models/VoucherPass';
import { PaginationData } from '../../../props/ApiResponses';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import CardHeaderFilterNext from '../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import SelectControl from '../../elements/select-control/SelectControl';
import VoucherPassesTable from './elements/VoucherPassesTable';
import ModalVoucherPassEdit from './modals/ModalVoucherPassEdit';

export default function VoucherPasses() {
    const organization = useActiveOrganization();
    const allowed = useCanManageVoucherPasses();

    return allowed ? (
        <VoucherPassesContent key={organization.id} organizationId={organization.id} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function VoucherPassesContent({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const passService = useVoucherPassService();
    const paginatorService = usePaginatorService();

    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paginatorKey] = useState('voucher_passes');
    const [rows, setRows] = useState<PaginationData<VoucherPass>>(null);

    const [filterValues, activeFilters, filterUpdate, filter] = useFilterNext(
        { q: '', state: '', print_requested: '', page: 1, per_page: paginatorService.getPerPage(paginatorKey, 10) },
        {
            queryParams: {
                q: StringParam,
                state: StringParam,
                print_requested: StringParam,
                page: NumberParam,
                per_page: NumberParam,
            },
        },
    );

    const editRow = useCallback(
        (row: VoucherPass) => {
            openModal((modal) => (
                <ModalVoucherPassEdit modal={modal} pass={row} onChanged={() => setRefresh((value) => value + 1)} />
            ));
        },
        [openModal],
    );

    useEffect(() => {
        runLatestRequest((config) => passService.list(organizationId, activeFilters, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setRows(response.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [activeFilters, organizationId, passService, pushApiError, refresh, runLatestRequest]);

    return (
        <div className="card form">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('voucher_passes.title')}
                    {rows && ` (${rows.meta.total})`}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <StateNavLink
                            name={DashboardRoutes.VOUCHER_PASSES_UPLOAD}
                            params={{ organizationId }}
                            className="button button-primary">
                            <em className="mdi mdi-upload icon-start" />
                            {translate('voucher_passes.buttons.import')}
                        </StateNavLink>
                    </div>

                    <CardHeaderFilterNext
                        filter={{ ...filter, update: (values) => filterUpdate({ ...values, page: 1 }) }}>
                        <FilterItemToggle show={true} label={translate('voucher_passes.search')}>
                            <input
                                className="form-control"
                                value={filterValues.q}
                                placeholder={translate('voucher_passes.search')}
                                onChange={(event) => filterUpdate({ q: event.target.value, page: 1 })}
                            />
                        </FilterItemToggle>

                        {(['state', 'print_requested'] as const).map((field) => (
                            <FilterItemToggle
                                key={field}
                                show={true}
                                label={translate(`voucher_passes.fields.${field}`)}>
                                <SelectControl
                                    value={filterValues[field]}
                                    propKey="value"
                                    options={[
                                        { value: '', name: translate('voucher_passes.all') },
                                        ...(field === 'state'
                                            ? ['active', 'deactivated'].map((value) => ({
                                                  value,
                                                  name: translate(`voucher_passes.${value}`),
                                              }))
                                            : [
                                                  { value: '1', name: translate('voucher_passes.yes') },
                                                  { value: '0', name: translate('voucher_passes.no') },
                                              ]),
                                    ]}
                                    onChange={(value: string) => filterUpdate({ [field]: value, page: 1 })}
                                />
                            </FilterItemToggle>
                        ))}
                    </CardHeaderFilterNext>
                </div>
            </div>

            <VoucherPassesTable
                rows={rows}
                loading={loading}
                paginatorKey={paginatorKey}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                onEdit={editRow}
            />
        </div>
    );
}
