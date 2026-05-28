import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import useTranslate from '../../../hooks/useTranslate';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { hasPermission } from '../../../helpers/utils';
import useSetProgress from '../../../hooks/useSetProgress';
import SelectControl from '../../elements/select-control/SelectControl';
import SelectControlOptionsFund from '../../elements/select-control/templates/SelectControlOptionsFund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useOpenModal from '../../../hooks/useOpenModal';
import usePaginatorService from '../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../props/ApiResponses';
import FundProductLimit from '../../../props/models/FundProductLimit';
import useFilterNext from '../../../modules/filter_next/useFilterNext';
import ClickOutside from '../../elements/click-outside/ClickOutside';
import FilterItemToggle from '../../elements/tables/elements/FilterItemToggle';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { dateFormat, dateParse } from '../../../helpers/dates';
import LoaderTableCard from '../../elements/loader-table-card/LoaderTableCard';
import { strLimit } from '../../../helpers/string';
import TableEmptyValue from '../../elements/table-empty-value/TableEmptyValue';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import { Permission } from '../../../props/models/Organization';
import ModalFundProductLimitEdit from '../../modals/ModalFundProductLimitEdit';
import TableRowActions from '../../elements/tables/TableRowActions';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushApiError from '../../../hooks/usePushApiError';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { useNavigateState } from '../../../modules/state_router/Router';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import { useFundProductLimitService } from '../../../services/FundProductLimitService';
import TableDateTime from '../../elements/tables/elements/TableDateTime';
import useProductService from '../../../services/ProductService';
import SponsorProduct from '../../../props/models/Sponsor/SponsorProduct';

export default function FundProductLimits() {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();
    const runLatestRequest = useLatestRequestWithProgress();

    const fundService = useFundService();
    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const fundProductLimitService = useFundProductLimitService();

    const [funds, setFunds] = useState<Array<Fund>>([]);
    const [products, setProducts] = useState<Array<SponsorProduct>>([]);
    const [paginatorKey] = useState('fund_product_limits');

    const [fundProductLimits, setFundProductLimits] = useState<PaginationData<FundProductLimit>>(null);

    const [states] = useState([
        { key: null, name: translate('fund_product_limits.states.all') },
        { key: 'active', name: translate('fund_product_limits.states.active') },
        { key: 'inactive', name: translate('fund_product_limits.states.inactive') },
    ]);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q?: string;
        to?: string;
        from?: string;
        state?: string;
        fund_id?: number;
        page?: number;
        per_page?: number;
    }>(
        {
            q: '',
            fund_id: null,
            state: null,
            from: null,
            to: null,
            page: 1,
            per_page: paginatorService.getPerPage(paginatorKey, 10),
        },
        {
            queryParams: {
                q: StringParam,
                fund_id: NumberParam,
                state: createEnumParam(['active', 'inactive']),
                from: StringParam,
                to: StringParam,
                per_page: NumberParam,
                page: NumberParam,
            },
        },
    );

    const fundOptions = useMemo(() => {
        return [{ id: null, name: 'Selecteer fonds' }, ...funds];
    }, [funds]);

    const fetchFundProductLimits = useCallback(() => {
        runLatestRequest(
            (config) => fundProductLimitService.list(activeOrganization.id, { ...filterValuesActive }, config),
            { onSuccess: (res) => setFundProductLimits(res.data) },
        );
    }, [activeOrganization?.id, runLatestRequest, fundProductLimitService, filterValuesActive]);

    const fetchFunds = useCallback(() => {
        setProgress(0);

        fundService
            .list(activeOrganization?.id, { state: 'active_paused_and_closed', per_page: 100 })
            .then((res) => {
                setFunds(res.data.data.filter((fund) => hasPermission(fund.organization, Permission.VALIDATE_RECORDS)));
            })
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization?.id]);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .sponsorProducts(activeOrganization?.id, { per_page: 100 })
            .then((res) => setProducts(res.data.data))
            .finally(() => setProgress(100));
    }, [setProgress, productService, activeOrganization?.id]);

    const createFundProductLimits = useCallback(() => {
        openModal((modal) => (
            <ModalFundProductLimitEdit
                modal={modal}
                funds={funds}
                products={products}
                fundId={filterValuesActive?.fund_id}
                organization={activeOrganization}
                onSubmit={fetchFundProductLimits}
            />
        ));
    }, [activeOrganization, fetchFundProductLimits, filterValuesActive?.fund_id, funds, openModal, products]);

    const editFundProductLimit = useCallback(
        (fundProductLimit: FundProductLimit) => {
            openModal((modal) => (
                <ModalFundProductLimitEdit
                    fundProductLimit={fundProductLimit}
                    modal={modal}
                    funds={funds}
                    products={products}
                    fundId={filterValuesActive?.fund_id}
                    organization={activeOrganization}
                    onSubmit={fetchFundProductLimits}
                />
            ));
        },
        [activeOrganization, fetchFundProductLimits, filterValuesActive?.fund_id, funds, openModal, products],
    );

    const activateFundProductLimit = useCallback(
        (fundProductLimit: FundProductLimit) => {
            fundProductLimitService
                .update(activeOrganization.id, fundProductLimit.id, {
                    ...fundProductLimit,
                    products: fundProductLimit.products.map((product) => product.id),
                    state: 'active',
                })
                .then(() => {
                    pushSuccess('Activated!');
                    fetchFundProductLimits();
                })
                .catch(pushApiError);
        },
        [activeOrganization.id, fetchFundProductLimits, fundProductLimitService, pushApiError, pushSuccess],
    );

    const deactivateFundProductLimit = useCallback(
        (fundProductLimit: FundProductLimit) => {
            fundProductLimitService
                .update(activeOrganization.id, fundProductLimit.id, {
                    ...fundProductLimit,
                    products: fundProductLimit.products.map((product) => product.id),
                    state: 'inactive',
                })
                .then(() => {
                    pushSuccess('Deactivated!');
                    fetchFundProductLimits();
                })
                .catch(pushApiError);
        },
        [activeOrganization.id, fetchFundProductLimits, fundProductLimitService, pushApiError, pushSuccess],
    );

    const deleteLimit = useCallback(
        (request: FundProductLimit) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_fund_product_limit.title')}
                    description={translate('modals.danger_zone.remove_fund_product_limit.description')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_fund_product_limit.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            fundProductLimitService
                                .destroy(activeOrganization?.id, request.id)
                                .then(() => {
                                    pushSuccess('Gelukt!', 'Verzoek verwijderd.');
                                    fetchFundProductLimits();
                                    modal.close();
                                })
                                .catch(pushApiError);
                        },
                        text: translate('modals.danger_zone.remove_fund_product_limit.buttons.confirm'),
                    }}
                />
            ));
        },
        [
            openModal,
            translate,
            activeOrganization?.id,
            fetchFundProductLimits,
            fundProductLimitService,
            pushApiError,
            pushSuccess,
        ],
    );

    useEffect(() => {
        fetchFundProductLimits();
    }, [fetchFundProductLimits]);

    useEffect(() => {
        fetchFunds();
    }, [fetchFunds]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (!activeOrganization?.allow_fund_product_limits) {
            navigateState(DashboardRoutes.ORGANIZATIONS);
        }
    }, [activeOrganization?.allow_fund_product_limits, navigateState]);

    if (!fundProductLimits) {
        return <LoadingCard />;
    }

    return (
        <div className="card form" data-dusk="tableFundProductLimitContent">
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {translate('fund_product_limits.header.title')} ({fundProductLimits?.meta?.total})
                </div>
                <div className="card-header-filters">
                    <div className="block block-inline-filters">
                        <button
                            className="button button-primary"
                            data-dusk="createFundProductLimitButton"
                            onClick={() => {
                                createFundProductLimits();
                            }}>
                            <em className="mdi mdi-plus icon-start" />
                            {translate('fund_product_limits.buttons.create')}
                        </button>

                        <div className="form-group">
                            <SelectControl
                                className="form-control inline-filter-control"
                                propKey={'id'}
                                options={fundOptions}
                                value={filter.activeValues.fund_id}
                                placeholder={translate('fund_product_limits.labels.fund')}
                                allowSearch={false}
                                onChange={(fund_id: number) => filter.update({ fund_id })}
                                optionsComponent={SelectControlOptionsFund}
                                dusk="fundProductLimitsSelectFund"
                            />
                        </div>

                        {filter.show && (
                            <div className="button button-text" onClick={() => filter.resetFilters()}>
                                <em className="mdi mdi-close icon-start" />
                                Wis filters
                            </div>
                        )}

                        {!filter.show && (
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="text"
                                        data-dusk="tableFundProductLimitSearch"
                                        placeholder={translate('fund_product_limits.labels.search')}
                                        value={filter.values.q}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form inline-filters-dropdown pull-right">
                            <ClickOutside onClickOutside={() => filter.setShow(false)}>
                                {filter.show && (
                                    <div className="inline-filters-dropdown-content">
                                        <div className="arrow-box bg-dim">
                                            <em className="arrow" />
                                        </div>

                                        <div className="form">
                                            <FilterItemToggle
                                                label={translate('fund_product_limits.labels.search')}
                                                show={true}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={filter.values.q}
                                                    placeholder={translate('fund_product_limits.labels.search')}
                                                    onChange={(e) => filter.update({ q: e.target.value })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('fund_product_limits.labels.state')}>
                                                <SelectControl
                                                    className="form-control"
                                                    propKey={'key'}
                                                    allowSearch={true}
                                                    options={states}
                                                    value={filter.values.state}
                                                    onChange={(state: string) => filter.update({ state })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('fund_product_limits.labels.from')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.from)}
                                                    onChange={(from: Date) => filter.update({ from: dateFormat(from) })}
                                                />
                                            </FilterItemToggle>

                                            <FilterItemToggle label={translate('fund_product_limits.labels.to')}>
                                                <DatePickerControl
                                                    value={dateParse(filter.values.to)}
                                                    onChange={(to: Date) => filter.update({ to: dateFormat(to) })}
                                                />
                                            </FilterItemToggle>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="button button-default button-icon"
                                    data-dusk="showFilters"
                                    onClick={() => filter.setShow(!filter.show)}>
                                    <em className="mdi mdi-filter-outline" />
                                </button>
                            </ClickOutside>
                        </div>
                    </div>
                </div>
            </div>

            <LoaderTableCard
                loading={!fundProductLimits.meta}
                empty={fundProductLimits?.meta?.total == 0 || funds?.length === 0}
                emptyTitle={
                    funds?.length === 0 ? 'Geen fondsen gevonden' : translate('fund_product_limits.empty.title')
                }
                emptyDescription={
                    funds?.length === 0
                        ? 'Maak eerst een fonds aan om prevalidatieverzoeken toe te voegen.'
                        : translate('fund_product_limits.empty.description')
                }
                emptyButton={
                    funds?.length === 0 &&
                    hasPermission(activeOrganization, Permission.MANAGE_FUNDS) && {
                        text: 'Fonds aanmaken',
                        type: 'primary',
                        icon: 'plus',
                        state: DashboardRoutes.FUND_CREATE,
                        stateParams: { organizationId: activeOrganization.id },
                    }
                }
                columns={fundProductLimitService.getColumns()}
                paginator={{ key: paginatorKey, data: fundProductLimits, filterValues, filterUpdate }}>
                {fundProductLimits?.data?.map((row) => (
                    <tr key={row.id} data-dusk={`tableFundProductLimitRow${row.id}`}>
                        <td className="text-primary text-strong">{row.id}</td>

                        <td>
                            <div className="text-primary text-semibold">
                                {row.fund ? strLimit(row.fund?.name, 32) : <TableEmptyValue />}
                            </div>

                            <div className="text-strong text-md text-muted-dark">
                                {row.fund ? strLimit(row.fund?.implementation?.name, 32) : <TableEmptyValue />}
                            </div>
                        </td>
                        <td>{row.type_locale}</td>
                        <td>{row.limit}</td>
                        <td>
                            <TableDateTime value={row.created_at_locale} />
                        </td>
                        <td>{translate(`fund_product_limits.states.${row.state}`)}</td>

                        <td className={'table-td-actions text-right'}>
                            <TableRowActions
                                dataDusk={'btnFundProductLimitMenu'}
                                content={({ close }) => (
                                    <div className="dropdown dropdown-actions">
                                        <div
                                            className="dropdown-item"
                                            data-dusk={`btnFundProductLimitDelete${row.id}`}
                                            onClick={() => {
                                                editFundProductLimit(row);
                                                close();
                                            }}>
                                            <em className="mdi mdi-pencil icon-start" />{' '}
                                            {translate('fund_product_limits.buttons.edit')}
                                        </div>
                                        {row.state === 'active' ? (
                                            <div
                                                className="dropdown-item"
                                                data-dusk={`btnFundProductLimitDeactivate${row.id}`}
                                                onClick={() => {
                                                    deactivateFundProductLimit(row);
                                                    close();
                                                }}>
                                                <em className="mdi mdi-close-circle-outline icon-start" />{' '}
                                                {translate('fund_product_limits.buttons.deactivate')}
                                            </div>
                                        ) : (
                                            <div
                                                className="dropdown-item"
                                                data-dusk={`btnFundProductLimitActivate${row.id}`}
                                                onClick={() => {
                                                    activateFundProductLimit(row);
                                                    close();
                                                }}>
                                                <em className="mdi mdi-play-circle-outline icon-start" />{' '}
                                                {translate('fund_product_limits.buttons.activate')}
                                            </div>
                                        )}
                                        <div
                                            className="dropdown-item"
                                            data-dusk={`btnFundProductLimitDelete${row.id}`}
                                            onClick={() => {
                                                deleteLimit(row);
                                                close();
                                            }}>
                                            <em className="mdi mdi-trash-can-outline icon-start" />{' '}
                                            {translate('fund_product_limits.buttons.delete')}
                                        </div>
                                    </div>
                                )}
                            />
                        </td>
                    </tr>
                ))}
            </LoaderTableCard>
        </div>
    );
}
