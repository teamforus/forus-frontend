import React, { useCallback, useEffect, useState } from 'react';
import { NumberParam, StringParam } from 'use-query-params';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useTranslate from '../../../hooks/useTranslate';
import useOpenModal from '../../../hooks/useOpenModal';
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
import Card from '../../elements/card/Card';
import CardHeaderFilterNext from '../../elements/tables/elements/CardHeaderFilterNext';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import EmptyCard from '../../elements/empty-card/EmptyCard';
import InfoBox from '../../elements/info-box/InfoBox';
import { Button } from '../../elements/button/Button';
import ModalRequesterImportsUpload from './modals/ModalRequesterImportsUpload/ModalRequesterImportsUpload';
import ModalRequesterImportEdit from './modals/ModalRequesterImportEdit';
import ModalRequesterImportsSync from './modals/ModalRequesterImportsSync/ModalRequesterImportsSync';
import RequesterImportsTable from './elements/RequesterImportsTable';

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
    const runCatalogRequest = useLatestRequest();
    const runLatestRequest = useLatestRequestWithProgress();

    const paginatorService = usePaginatorService();
    const recordTypeService = useRecordTypeService();
    const requesterImportService = useRequesterImportService();

    const [refresh, setRefresh] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [paginatorKey] = useState('requester_imports');
    const [catalogFailed, setCatalogFailed] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [rows, setRows] = useState<PaginationData<RequesterImportRow>>(null);
    const [recordTypes, setRecordTypes] = useState<RequesterImportRecordType[]>(null);

    const [filterValues, activeFilters, filterUpdate, filter] = useFilterNext(
        { q: '', page: 1, per_page: paginatorService.getPerPage(paginatorKey, 10) },
        { queryParams: { q: StringParam, page: NumberParam, per_page: NumberParam } },
    );

    const fetchRows = useCallback(() => {
        runLatestRequest((config) => requesterImportService.list(organization.id, activeFilters, config), {
            onStart: () => {
                setLoading(true);
                setLoadFailed(false);
            },
            onSuccess: (response) => setRows(response.data),
            onError: () => setLoadFailed(true),
            onFinally: () => setLoading(false),
        });
    }, [activeFilters, organization.id, requesterImportService, runLatestRequest]);

    const fetchCatalog = useCallback(() => {
        runCatalogRequest(
            () =>
                recordTypeService.list<RequesterImportRecordType>({
                    requester_imports: 1,
                    organization_id: organization.id,
                }),
            {
                onStart: () => {
                    setCatalogLoading(true);
                    setCatalogFailed(false);
                },
                onSuccess: (response) => setRecordTypes(response.data),
                onError: () => setCatalogFailed(true),
                onFinally: () => setCatalogLoading(false),
            },
        );
    }, [organization.id, recordTypeService, runCatalogRequest]);

    const openImport = useCallback(() => {
        openModal((modal) => (
            <ModalRequesterImportsUpload
                modal={modal}
                organizationId={organization.id}
                recordTypes={recordTypes}
                onChanged={() => setRefresh((value) => value + 1)}
            />
        ));
    }, [openModal, organization.id, recordTypes]);

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

    const openSync = useCallback(() => {
        openModal((modal) => (
            <ModalRequesterImportsSync
                modal={modal}
                organizationId={organization.id}
                onChanged={() => setRefresh((value) => value + 1)}
            />
        ));
    }, [openModal, organization.id]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows, refresh]);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    return (
        <>
            <div className="block block-breadcrumbs">
                <div className="breadcrumb-item active">{translate('requester_imports.title')}</div>
            </div>
            <Card
                title={`${translate('requester_imports.records_title')}${rows ? ` (${rows.meta.total})` : ''}`}
                className="form"
                section={false}
                buttons={[
                    {
                        text: translate('requester_imports.buttons.sync'),
                        icon: 'sync',
                        type: 'default',
                        onClick: openSync,
                    },
                    {
                        text: translate('requester_imports.buttons.import'),
                        icon: 'upload',
                        type: 'primary',
                        disabled: catalogLoading || !recordTypes?.length,
                        onClick: openImport,
                    },
                ]}
                filters={
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
                }>
                {!catalogLoading && (catalogFailed || recordTypes?.length === 0) && (
                    <div className="card-section">
                        <InfoBox iconType="warning" iconColor="warning">
                            <p role="alert">
                                {catalogFailed
                                    ? translate('requester_imports.loading_failed')
                                    : translate('requester_imports.no_enabled_columns')}
                            </p>
                            <Button
                                text={translate('requester_imports.buttons.retry')}
                                size="sm"
                                onClick={fetchCatalog}
                            />
                        </InfoBox>
                    </div>
                )}
                {loadFailed ? (
                    <EmptyCard
                        type="card-section"
                        title={translate('requester_imports.loading_failed')}
                        button={{ text: translate('requester_imports.buttons.retry'), onClick: fetchRows }}
                    />
                ) : (
                    <RequesterImportsTable
                        rows={rows}
                        recordTypes={recordTypes}
                        loading={loading || catalogLoading}
                        paginatorKey={paginatorKey}
                        filterValues={filterValues}
                        filterUpdate={filterUpdate}
                        onEdit={editRow}
                    />
                )}
            </Card>
        </>
    );
}
