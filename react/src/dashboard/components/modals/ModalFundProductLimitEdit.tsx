import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import SelectControl from '../elements/select-control/SelectControl';
import Organization from '../../props/models/Organization';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormPane from '../elements/forms/elements/FormPane';
import Fund from '../../props/models/Fund';
import FundProductLimit from '../../props/models/FundProductLimit';
import { useFundProductLimitService } from '../../services/FundProductLimitService';
import SponsorProduct from '../../props/models/Sponsor/SponsorProduct';
import useTranslate from '../../hooks/useTranslate';
import useProductService from '../../services/ProductService';
import { useHelperService } from '../../services/HelperService';
import useLatestRequest from '../../hooks/useLatestRequest';
import Modal from './elements/Modal';

export default function ModalFundProductLimitEdit({
    modal,
    funds,
    fundId,
    fundProductLimit,
    onSubmit,
    organization,
}: {
    modal: ModalState;
    funds: Array<Fund>;
    fundId?: number;
    fundProductLimit?: FundProductLimit;
    onSubmit: () => void;
    organization: Organization;
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const translate = useTranslate();

    const fundProductLimitService = useFundProductLimitService();
    const productService = useProductService();
    const helperService = useHelperService();
    const runLatestRequest = useLatestRequest();

    const [products, setProducts] = useState<Array<SponsorProduct>>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [types] = useState<Array<{ id: string; name: string }>>([
        {
            id: 'all_except_selected',
            name: translate('modals.modal_fund_product_limit_edit.labels.type_all_except_selected'),
        },
        { id: 'only_selected', name: translate('modals.modal_fund_product_limit_edit.labels.type_only_selected') },
    ]);

    const form = useFormBuilder(
        fundProductLimit
            ? {
                  fund_id: fundProductLimit.fund_id,
                  type: fundProductLimit.type,
                  state: fundProductLimit.state,
                  limit: fundProductLimit.limit,
                  products: fundProductLimit.products.map((p) => p.id),
              }
            : {
                  fund_id: fundId || funds[0]?.id,
                  type: 'all_except_selected',
                  state: 'active',
                  limit: 1,
                  products: [],
              },
        (values) => {
            const data = {
                ...values,
                products: values.products.filter((p) => p),
            };

            const promise =
                fundProductLimit == null
                    ? fundProductLimitService.store(organization.id, data)
                    : fundProductLimitService.update(organization.id, fundProductLimit.id, data);

            promise
                .then(() => {
                    onSubmit();
                    pushSuccess(translate('modals.modal_fund_product_limit_edit.notifications.saved'));
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data?.errors);
                    pushApiError(err);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    const productOptions = useMemo(() => {
        return [
            { id: null, name: translate('modals.modal_fund_product_limit_edit.labels.select_product') },
            ...products.map((product) => ({
                ...product,
                name: `#${product.id} - ${product.name}`,
            })),
        ];
    }, [products, translate]);

    const productsMode = form.values.type === 'all_except_selected' ? 'excluded' : 'selected';

    const fetchProducts = useCallback(() => {
        if (!form.values.fund_id) {
            setProducts([]);

            return;
        }

        runLatestRequest(
            (config) =>
                helperService.recursiveLeach<SponsorProduct>(
                    (page: number) =>
                        productService.sponsorProducts(
                            organization.id,
                            { fund_id: form.values.fund_id, per_page: 100, page },
                            config,
                        ),
                    4,
                ),
            {
                onStart: () => {
                    setProducts([]);
                    setProductsLoading(true);
                },
                onSuccess: setProducts,
                onError: pushApiError,
                onFinally: () => setProductsLoading(false),
            },
        );
    }, [form.values.fund_id, helperService, organization.id, productService, pushApiError, runLatestRequest]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <Modal
            modal={modal}
            title={translate('modals.modal_fund_product_limit_edit.title')}
            onSubmit={form.submit}
            footer={
                <>
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('modals.modal_fund_product_limit_edit.buttons.cancel')}
                    </button>
                    <button className="button button-primary" type="submit">
                        {translate('modals.modal_fund_product_limit_edit.buttons.submit')}
                    </button>
                </>
            }>
            <div className="flex flex-gap flex-vertical">
                <FormPane title={translate('modals.modal_fund_product_limit_edit.panes.settings')}>
                    <FormGroup
                        required={true}
                        label={translate('modals.modal_fund_product_limit_edit.labels.fund')}
                        info={translate('modals.modal_fund_product_limit_edit.info.fund')}
                        error={form.errors?.fund_id}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={form.values.fund_id}
                                propKey="id"
                                options={funds}
                                allowSearch={true}
                                onChange={(fund_id: number) => form.update({ fund_id, products: [] })}
                            />
                        )}
                    />

                    <FormGroup
                        required={true}
                        label={translate('modals.modal_fund_product_limit_edit.labels.type')}
                        info={translate('modals.modal_fund_product_limit_edit.info.type')}
                        error={form.errors?.type}
                        input={(id) => (
                            <SelectControl
                                id={id}
                                value={form.values.type}
                                propKey="id"
                                options={types}
                                allowSearch={false}
                                onChange={(type: string) => form.update({ type })}
                            />
                        )}
                    />

                    <FormGroup
                        required={true}
                        label={translate('modals.modal_fund_product_limit_edit.labels.limit')}
                        info={translate('modals.modal_fund_product_limit_edit.info.limit')}
                        error={form.errors?.limit}
                        input={(id) => (
                            <input
                                type="number"
                                id={id}
                                className="form-control"
                                value={form.values.limit}
                                placeholder={translate('modals.modal_fund_product_limit_edit.placeholders.limit')}
                                onChange={(e) => form.update({ limit: Number(e.target.value) })}
                            />
                        )}
                    />
                </FormPane>

                <FormPane
                    title={translate(`modals.modal_fund_product_limit_edit.panes.products.${productsMode}`)}
                    description={translate(
                        `modals.modal_fund_product_limit_edit.descriptions.products.${productsMode}`,
                    )}>
                    <FormGroup
                        label={translate(`modals.modal_fund_product_limit_edit.labels.products.${productsMode}`)}
                        error={form.errors?.products}
                        input={() => (
                            <div className="flex flex-vertical flex-gap">
                                {form.values.products.map((p, index) => (
                                    <div className="form-group-info" key={index}>
                                        <div className="form-group-info-control">
                                            <SelectControl
                                                value={p}
                                                propKey="id"
                                                options={productOptions}
                                                allowSearch={true}
                                                disabled={productsLoading || !form.values.fund_id}
                                                onChange={(id: number) => {
                                                    const updated = [...form.values.products];
                                                    updated[index] = id;

                                                    form.update({ products: updated });
                                                }}
                                            />
                                        </div>

                                        <div className="form-group-info-button">
                                            <button
                                                type="button"
                                                className="button button-icon button-default"
                                                onClick={() =>
                                                    form.update({
                                                        products: form.values.products.filter((_, i) => i !== index),
                                                    })
                                                }>
                                                <em className="mdi mdi-close" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="button button-primary"
                                    disabled={
                                        productsLoading ||
                                        !form.values.fund_id ||
                                        form.values.products.filter((p) => p === null).length > 0
                                    }
                                    onClick={() => form.update({ products: [...form.values.products, null] })}>
                                    <em className="mdi mdi-plus icon-start" />
                                    {translate('modals.modal_fund_product_limit_edit.buttons.add_product')}
                                </button>
                            </div>
                        )}
                    />
                </FormPane>
            </div>
        </Modal>
    );
}
