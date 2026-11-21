import React, { useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import FundProvider from '../../props/models/FundProvider';
import Organization from '../../props/models/Organization';
import Product from '../../props/models/Product';
import { PaginationData } from '../../props/ApiResponses';
import useProductService from '../../services/ProductService';
import useProviderFundService from '../../services/ProviderFundService';
import Paginator from '../../modules/paginator/components/Paginator';
import { strLimit } from '../../helpers/string';
import StateNavLink from '../../modules/state_router/StateNavLink';
import usePaginatorService from '../../modules/paginator/services/usePaginatorService';
import useTranslate from '../../hooks/useTranslate';
import classNames from 'classnames';
import TableEmptyValue from '../elements/table-empty-value/TableEmptyValue';
import Label from '../elements/label/Label';
import { DashboardRoutes } from '../../modules/state_router/RouterBuilder';
import useFilterNext from '../../modules/filter_next/useFilterNext';
import useLatestRequestWithProgress from '../../hooks/useLatestRequestWithProgress';

export default function ModalFundOffers({
    modal,
    providerFund,
    organization,
    className,
}: {
    modal: ModalState;
    providerFund: FundProvider;
    organization: Organization;
    className?: string;
}) {
    const translate = useTranslate();
    const runLatestRequest = useLatestRequestWithProgress();

    const productService = useProductService();
    const paginatorService = usePaginatorService();
    const providerFundService = useProviderFundService();

    const [offers, setOffers] = useState<PaginationData<Product>>(null);
    const [paginatorKey] = useState('modal_fund_offers');
    const [enabledProducts, setEnabledProducts] = useState<number[]>([]);

    const [filterValues, filterValuesActive, filterUpdate] = useFilterNext({
        per_page: paginatorService.getPerPage(paginatorKey),
    });

    const offerRows = useMemo(() => {
        return offers?.data.map((product) => ({ product, allowed: enabledProducts.includes(product.id) })) ?? [];
    }, [offers, enabledProducts]);

    useEffect(() => {
        providerFundService.readFundProvider(organization.id, providerFund.id).then((res) => {
            setEnabledProducts(res.data.data.products);
        });
    }, [organization.id, providerFund.id, providerFundService]);

    useEffect(() => {
        runLatestRequest((config) => productService.list(organization.id, filterValuesActive, config), {
            onSuccess: (res) => setOffers(res.data),
        });
    }, [filterValuesActive, organization.id, productService, runLatestRequest]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-fund-offers',
                modal.loading && 'modal-loading',
                className,
            )}>
            <div className="modal-backdrop" onClick={modal.close} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_funds_offers.title')}</div>
                <div className="modal-body form">
                    <div className="modal-section">
                        <div className="card-block card-block-table">
                            <div className="table-wrapper">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{translate('modals.modal_funds_offers.labels.name')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.stock')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.price')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_amount')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_user_amount')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_user_limit')}</th>
                                            <th>{translate('modals.modal_funds_offers.labels.subsidy_limit_total')}</th>
                                            <th className="text-right">
                                                {translate('modals.modal_funds_offers.labels.status')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {offerRows.map(({ product, allowed }) => (
                                            <tr key={product.id}>
                                                <td title={product.name}>
                                                    <StateNavLink
                                                        name={DashboardRoutes.PRODUCT}
                                                        params={{ organizationId: organization.id, id: product.id }}
                                                        target={'_blank'}
                                                        className={'text-primary text-semibold'}>
                                                        {strLimit(product.name, 45)}
                                                    </StateNavLink>
                                                </td>
                                                <td>
                                                    {product.unlimited_stock ? 'Ongelimiteerd' : product.stock_amount}
                                                </td>
                                                <td>
                                                    <div className="offer-price">{product.price_locale}</div>
                                                </td>
                                                <td>{allowed ? product.price_locale : <TableEmptyValue />}</td>
                                                <td>{allowed ? null : <TableEmptyValue />}</td>
                                                <td>
                                                    <TableEmptyValue />
                                                </td>
                                                <td>{allowed ? null : <TableEmptyValue />}</td>

                                                <td className="text-right">
                                                    <Label type={allowed ? 'success' : 'default'}>
                                                        {allowed
                                                            ? translate(`modals.modal_funds_offers.labels.available`)
                                                            : translate(`modals.modal_funds_offers.labels.rejected`)}
                                                    </Label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!offers && (
                                <div className={'card'}>
                                    <div className="card-section">
                                        <div className="card-loading">
                                            <div className="mdi mdi-loading mdi-spin" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    {offers?.meta && (
                        <Paginator
                            className={'flex-grow'}
                            meta={offers.meta}
                            filters={filterValues}
                            updateFilters={filterUpdate}
                            perPageKey={paginatorKey}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
