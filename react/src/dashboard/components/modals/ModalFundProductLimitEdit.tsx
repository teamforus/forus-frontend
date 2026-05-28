import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import SelectControl from '../elements/select-control/SelectControl';
import Organization from '../../props/models/Organization';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushApiError from '../../hooks/usePushApiError';
import { ResponseError } from '../../props/ApiResponses';
import FormGroup from '../elements/forms/elements/FormGroup';
import Fund from '../../props/models/Fund';
import FundProductLimit from '../../props/models/FundProductLimit';
import { useFundProductLimitService } from '../../services/FundProductLimitService';
import SponsorProduct from '../../props/models/Sponsor/SponsorProduct';
import useTranslate from '../../hooks/useTranslate';
import InfoBox from '../elements/info-box/InfoBox';

export default function ModalFundProductLimitEdit({
    modal,
    funds,
    fundId,
    products,
    fundProductLimit,
    onSubmit,
    organization,
}: {
    modal: ModalState;
    funds: Array<Fund>;
    fundId?: number;
    products: Array<SponsorProduct>;
    fundProductLimit?: FundProductLimit;
    onSubmit: () => void;
    organization: Organization;
}) {
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const translate = useTranslate();

    const fundProductLimitService = useFundProductLimitService();

    const [types] = useState<Array<{ id: string; name: string }>>([
        { id: 'all', name: translate('modals.modal_fund_product_limit_edit.labels.type_all') },
        { id: 'selected', name: translate('modals.modal_fund_product_limit_edit.labels.type_selected') },
    ]);

    const productOptions = useMemo(() => {
        return [
            { id: null, name: translate('modals.modal_fund_product_limit_edit.labels.select_product') },
            ...products.map((product) => ({
                ...product,
                name: `#${product.id} - ${product.name}`,
            })),
        ];
    }, [products, translate]);

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
                  type: 'all',
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
                    pushSuccess('Gelukt!', 'Product limit updated!');
                    modal.close();
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data?.errors);
                    pushApiError(err);
                })
                .finally(() => form.setIsLocked(false));
        },
    );

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_fund_product_limit_edit.title')}</div>

                <div className="modal-body modal-body-visible">
                    <div className="modal-section">
                        <div className="row">
                            <div className="col-lg-10 col-offset-lg-1">
                                <FormGroup
                                    required={true}
                                    label={translate('modals.modal_fund_product_limit_edit.labels.fund')}
                                    info={translate('modals.modal_fund_product_limit_edit.info.fund')}
                                    error={form.errors?.fund_id}
                                    input={(id) => (
                                        <SelectControl
                                            id={id}
                                            className="form-control"
                                            value={form.values.fund_id}
                                            propKey="id"
                                            options={funds}
                                            allowSearch={true}
                                            onChange={(fund_id: number) => {
                                                form.update({ fund_id });
                                            }}
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
                                            className="form-control"
                                            value={form.values.type}
                                            propKey="id"
                                            options={types}
                                            allowSearch={false}
                                            onChange={(type: string) => {
                                                form.update({ type });
                                            }}
                                        />
                                    )}
                                />

                                <FormGroup
                                    label={translate('modals.modal_fund_product_limit_edit.labels.products')}
                                    error={form.errors?.products}
                                    input={() => (
                                        <div className="flex flex-vertical flex-gap">
                                            {form.values.products.map((p, index) => (
                                                <div className="form-group-info" key={index}>
                                                    <div className="form-group-info-control">
                                                        <SelectControl
                                                            className="form-control"
                                                            value={p}
                                                            propKey="id"
                                                            options={productOptions}
                                                            allowSearch={true}
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
                                                                    products: form.values.products.filter(
                                                                        (_, i) => i !== index,
                                                                    ),
                                                                })
                                                            }>
                                                            <em className="mdi mdi-close" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className="button button-icon button-default"
                                                disabled={form.values.products.filter((p) => p === null).length > 0}
                                                onClick={() =>
                                                    form.update({ products: [...form.values.products, null] })
                                                }>
                                                <em className="mdi mdi-plus" />
                                            </button>
                                        </div>
                                    )}
                                />

                                <InfoBox type={'primary'}>
                                    {translate('modals.modal_fund_product_limit_edit.info.products')}
                                </InfoBox>

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
                                            placeholder={translate(
                                                'modals.modal_fund_product_limit_edit.placeholders.limit',
                                            )}
                                            onChange={(e) => form.update({ limit: Number(e.target.value) })}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer text-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('modals.modal_fund_product_limit_edit.buttons.cancel')}
                    </button>
                    <button className="button button-primary" data-dusk="submitBtn" type="submit">
                        {translate('modals.modal_fund_product_limit_edit.buttons.submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}
