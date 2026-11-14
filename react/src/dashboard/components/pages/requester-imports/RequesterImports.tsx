import React, { useCallback, useEffect, useState } from 'react';
import { NumberParam, StringParam } from 'use-query-params';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useTranslate from '../../../hooks/useTranslate';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushApiError from '../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import useLatestRequest from '../../../hooks/useLatestRequest';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import { useRequesterImportService } from '../../../services/RequesterImportService';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import RequesterImportRow, { RequesterImportRecordType } from '../../../props/models/RequesterImportRow';
import Organization from '../../../props/models/Organization';
import { PaginationData } from '../../../props/ApiResponses';
import useCanManageRequesterImports from '../../../hooks/permissions/useCanManageRequesterImports';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import CardHeaderFilterNext from '../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import InfoBox from '../../elements/info-box/InfoBox';
import ModalRequesterImportEdit from './modals/ModalRequesterImportEdit';
import RequesterImportsTable from './elements/RequesterImportsTable';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function RequesterImports() {
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();

    return canManageRequesterImports ? (
        <RequesterImportsContent key={organization.id} organization={organization} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function RequesterImportsContent({ organization }: { organization: Organization }) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const runCatalogRequest = useLatestRequest();
    const runLatestRequest = useLatestRequestWithProgress();

    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const requesterImportService = useRequesterImportService();

    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paginatorKey] = useState('requester_imports');
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [rows, setRows] = useState<PaginationData<RequesterImportRow>>(null);
    const [recordTypes, setRecordTypes] = useState<RequesterImportRecordType[]>(null);

    const [filterValues, activeFilters, filterUpdate, filter] = useFilterNext(
        { q: '', page: 1, per_page: paginatorService.getPerPage(paginatorKey, 10) },
        { queryParams: { q: StringParam, page: NumberParam, per_page: NumberParam } },
    );

    const fetchRows = useCallback(() => {
        runLatestRequest((config) => requesterImportService.list(organization.id, activeFilters, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setRows(response.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [activeFilters, organization.id, pushApiError, requesterImportService, runLatestRequest]);

    const fetchCatalog = useCallback(() => {
        runCatalogRequest(
            () =>
                recordTypeService.list<RequesterImportRecordType>({
                    requester_imports: 1,
                    organization_id: organization.id,
                }),
            {
                onStart: () => setCatalogLoading(true),
                onSuccess: (response) => setRecordTypes(response.data),
                onError: pushApiError,
                onFinally: () => setCatalogLoading(false),
            },
        );
    }, [organization.id, pushApiError, recordTypeService, runCatalogRequest]);

    const editRow = useCallback(
        (row: RequesterImportRow) => {
            openModal((modal) => (
                <ModalRequesterImportEdit
                    modal={modal}
                    row={row}
                    recordTypes={recordTypes}
                    onChanged={() => setRefresh((value) => value + 1)}
                />
            ));
        },
        [openModal, recordTypes],
    );

    useEffect(() => {
        fetchRows();
    }, [fetchRows, refresh]);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    return (
        <div className="card form">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('requester_imports.records_title')}
                    {rows && ` (${rows.meta.total})`}
                </div>

                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <StateNavLink
                            name={DashboardRoutes.REQUESTER_IMPORTS_SYNC}
                            params={{ organizationId: organization.id }}
                            className="button button-default">
                            <em className="mdi mdi-sync icon-start" />
                            {translate('requester_imports.buttons.sync')}
                        </StateNavLink>

                        <StateNavLink
                            name={DashboardRoutes.REQUESTER_IMPORTS_UPLOAD}
                            params={{ organizationId: organization.id }}
                            className="button button-primary">
                            <em className="mdi mdi-upload icon-start" />
                            {translate('requester_imports.buttons.import')}
                        </StateNavLink>
                    </div>

                    <CardHeaderFilterNext
                        filter={{ ...filter, update: (values) => filterUpdate({ ...values, page: 1 }) }}>
                        <FilterItemToggle show={true} label={translate('requester_imports.labels.search')}>
                            <input
                                type="text"
                                className="form-control"
                                value={filterValues.q}
                                placeholder={translate('requester_imports.labels.search')}
                                aria-label={translate('requester_imports.labels.search')}
                                onChange={(event) => filterUpdate({ q: event.target.value, page: 1 })}
                            />
                        </FilterItemToggle>
                    </CardHeaderFilterNext>
                </div>
            </div>

            {!catalogLoading && recordTypes?.length === 0 && (
                <div className="card-section">
                    <InfoBox iconType="warning" iconColor="warning">
                        <p role="alert">{translate('requester_imports.no_enabled_columns')}</p>
                    </InfoBox>
                </div>
            )}

            <RequesterImportsTable
                rows={rows}
                recordTypes={recordTypes}
                loading={loading || catalogLoading}
                paginatorKey={paginatorKey}
                filterValues={filterValues}
                filterUpdate={filterUpdate}
                onEdit={editRow}
            />
        </div>
    );
}
