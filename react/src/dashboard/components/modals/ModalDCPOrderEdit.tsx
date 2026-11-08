import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import useTranslate from '../../hooks/useTranslate';
import usePushApiError from '../../hooks/usePushApiError';
import usePushSuccess from '../../hooks/usePushSuccess';
import { ResponseError } from '../../props/ApiResponses';
import Organization from '../../props/models/Organization';
import DCPOrder, { DCPOrderField, DCPOrderTagField } from '../../props/models/DCPOrder';
import { useDCPOrderService } from '../../services/DCPOrderService';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormError from '../elements/forms/errors/FormError';
import InfoBox from '../elements/info-box/InfoBox';

type Values = { [key: string]: string };

const fieldValues = (fields: Array<DCPOrderField>): Values => {
    return fields.reduce((values, field) => ({ ...values, [field.key]: field.value || '' }), {});
};

export default function ModalDCPOrderEdit({
    modal,
    order,
    organization,
    className,
    onUpdated,
}: {
    modal: ModalState;
    order: DCPOrder;
    organization: Organization;
    className?: string;
    onUpdated: (order: DCPOrder) => void;
}) {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();

    const dcpOrderService = useDCPOrderService();

    const initialValues = useMemo(
        () => ({
            delivery_address: fieldValues(order.delivery_address_fields),
            tags: fieldValues(order.tag_fields),
        }),
        [order.delivery_address_fields, order.tag_fields],
    );

    const form = useFormBuilder<{ delivery_address: Values; tags: Values }>(initialValues, (values) => {
        setProgress(0);

        dcpOrderService
            .update(organization.id, order.id, values)
            .then((res) => {
                pushSuccess(translate('dcp_orders_view.notifications.updated'));
                onUpdated(res.data.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                form.setErrors(err.data?.errors || {});
                pushApiError(err);
            })
            .finally(() => {
                setProgress(100);
                form.setIsLocked(false);
            });
    });

    const fieldInfo = (field: DCPOrderTagField) => {
        return [
            field.source_locale
                ? translate('dcp_orders_view.labels.source_field', { source: field.source_locale })
                : null,
            field.max ? translate('dcp_orders_view.labels.max', { max: field.max }) : null,
        ]
            .filter((value) => value)
            .join(' · ');
    };

    const renderField = (group: 'delivery_address' | 'tags', field: DCPOrderField | DCPOrderTagField) => (
        <FormGroup
            key={`${group}_${field.key}`}
            label={field.key}
            required={field.required}
            error={form.errors?.[`${group}.${field.key}`]}
            input={(id) => (
                <div className="flex flex-vertical flex-gap-xs">
                    <input
                        id={id}
                        type="text"
                        className="form-control"
                        maxLength={(field as DCPOrderTagField).max || undefined}
                        value={form.values?.[group]?.[field.key] || ''}
                        onChange={(e) =>
                            form.update({ [group]: { ...form.values[group], [field.key]: e.target.value } })
                        }
                    />
                    {group === 'tags' && fieldInfo(field) && (
                        <div className="text-muted">{fieldInfo(field as DCPOrderTagField)}</div>
                    )}
                    {field.errors.map((error, index) => (
                        <div key={index} className="text-danger">
                            {error}
                        </div>
                    ))}
                </div>
            )}
        />
    );

    return (
        <div className={classNames('modal', 'modal-animated', 'modal-md', modal.loading && 'modal-loading', className)}>
            <div className="modal-backdrop" onClick={modal.close} />

            <form className="modal-window form" onSubmit={form.submit}>
                <a className="mdi mdi-close modal-close" onClick={modal.close} role="button" />

                <div className="modal-header">{translate('dcp_orders_view.edit.title', { id: order.id })}</div>

                <div className="modal-body">
                    <div className="modal-section modal-section-pad">
                        <InfoBox>
                            <p>{translate('dcp_orders_view.edit.info')}</p>
                            {order.state === 'error' && <p>{translate('dcp_orders_view.edit.info_error')}</p>}
                        </InfoBox>

                        <FormError error={form.errors?.payload} />
                    </div>

                    <div className="modal-section modal-section-pad">
                        <div className="modal-heading">{translate('dcp_orders_view.header.delivery_address')}</div>
                        <div className="form">
                            {order.delivery_address_fields.map((field) => renderField('delivery_address', field))}
                        </div>
                    </div>

                    <div className="modal-section modal-section-pad">
                        <div className="modal-heading">{translate('dcp_orders_view.header.tag_fields')}</div>
                        <div className="form">{order.tag_fields.map((field) => renderField('tags', field))}</div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="button-group flex-center">
                        <button className="button button-default" type="button" onClick={modal.close}>
                            {translate('dcp_orders_view.edit.cancel')}
                        </button>
                        <button className="button button-primary" type="submit" disabled={form.isLocked}>
                            {translate('dcp_orders_view.edit.save')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
