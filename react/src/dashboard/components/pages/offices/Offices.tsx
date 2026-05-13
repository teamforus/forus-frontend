import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { NavLink } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { hasPermission } from '../../../helpers/utils';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Office from '../../../props/models/Office';
import useOfficeService from '../../../services/OfficeService';
import OfficeSchedule from '../../../props/models/OfficeSchedule';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import { Permission } from '../../../props/models/Organization';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import { PaginationData } from '../../../props/ApiResponses';
import OfficesTableItem from './elements/OfficesTableItem';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';

export type OfficeLocal = Office & {
    scheduleByDay: { [key: string]: OfficeSchedule };
};

export default function Offices() {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const organization = useActiveOrganization();
    const officeService = useOfficeService();
    const paginatorService = usePaginatorService();

    const [offices, setOffices] = useState<PaginationData<OfficeLocal>>(null);
    const [paginatorKey] = useState('offices');

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext<{ q?: string; per_page: number }>({
        q: '',
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const fetchOffices = useCallback(() => {
        runLatestRequest((config) => officeService.list(organization.id, { ...filterValuesActive }, config), {
            onSuccess: (res) =>
                setOffices({
                    ...res.data,
                    data: res.data.data.map((office) => ({
                        ...office,
                        scheduleByDay: office.schedule.reduce(
                            (item, schedule) => ({ ...item, ...{ [schedule.week_day]: schedule } }),
                            {},
                        ),
                    })),
                }),
            onError: pushApiError,
        });
    }, [runLatestRequest, pushApiError, officeService, organization.id, filterValuesActive]);

    useEffect(() => {
        fetchOffices();
    }, [fetchOffices]);

    if (!offices) {
        return <LoadingCard />;
    }

    return (
        <>
            <div className="card">
                <div className="card-section">
                    <div className="card-section-actions">
                        {hasPermission(organization, Permission.MANAGE_ORGANIZATION) && (
                            <NavLink
                                id="edit_office"
                                to={getStateRouteUrl(DashboardRoutes.ORGANIZATION_EDIT, {
                                    organizationId: organization.id,
                                })}
                                className="button button-default">
                                <em className="mdi mdi-pen icon-start" />
                                {translate('offices.buttons.adjust')}
                            </NavLink>
                        )}
                    </div>
                    <div className="card-block card-block-provider">
                        <div className="provider-img">
                            <img
                                src={
                                    organization.logo?.sizes.thumbnail ||
                                    assetUrl('/assets/img/placeholders/organization-thumbnail.png')
                                }
                                alt={''}
                            />
                        </div>
                        <div className="provider-details">
                            <NavLink
                                className="provider-title"
                                to={getStateRouteUrl(DashboardRoutes.ORGANIZATION_EDIT, {
                                    organizationId: organization.id,
                                })}>
                                {organization.name}
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">{translate('offices.labels.business_type')}</div>
                            <div
                                className={classNames(
                                    'keyvalue-value',
                                    !organization.business_type?.name && 'text-muted',
                                )}>
                                {organization.business_type?.name || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">{translate('offices.labels.mail')}</div>
                            <div
                                className={classNames(
                                    'keyvalue-value',
                                    !organization.email ? 'text-muted' : 'text-primary-light',
                                )}>
                                {organization.email || 'Geen data'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-section card-section-primary">
                    <div className="card-block card-block-keyvalue card-block-keyvalue-horizontal row">
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">KVK</div>
                            <div className={classNames('keyvalue-value', !organization.kvk && 'text-muted')}>
                                {organization.kvk || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">BTW</div>
                            <div className={classNames('keyvalue-value', !organization.btw && 'text-muted')}>
                                {organization.btw || 'Geen data'}
                            </div>
                        </div>
                        <div className="keyvalue-item col-xs-12 col-sm-6 col-lg-4">
                            <div className="keyvalue-key">IBAN</div>
                            <div className={classNames('keyvalue-value', !organization.iban && 'text-muted')}>
                                {organization.iban || 'Geen data'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {offices && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title flex flex-grow">
                            {translate('offices.labels.offices')} ({offices?.meta?.total})
                        </div>

                        <div className="card-header-filters">
                            <div className="block block-inline-filters">
                                <StateNavLink
                                    name={DashboardRoutes.OFFICE_CREATE}
                                    params={{ organizationId: organization.id }}
                                    className="button button-primary">
                                    <em className="mdi mdi-plus-circle icon-start" />
                                    Voeg een nieuwe vestiging toe
                                </StateNavLink>

                                <div className="form">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Zoeken"
                                            value={filterValues.q}
                                            onChange={(e) => filterUpdate({ q: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <LoaderTableCard
                        loading={!offices.meta}
                        empty={offices?.meta?.total == 0}
                        emptyTitle={translate('offices.empty.title')}
                        emptyDescription={translate('offices.empty.description')}
                        columns={officeService.getColumns()}
                        paginator={{ key: paginatorKey, data: offices, filterValues, filterUpdate }}>
                        {offices?.data?.map((office) => (
                            <OfficesTableItem
                                key={office.id}
                                organization={organization}
                                offices={offices}
                                office={office}
                                fetchOffices={fetchOffices}
                            />
                        ))}
                    </LoaderTableCard>
                </div>
            )}
        </>
    );
}
