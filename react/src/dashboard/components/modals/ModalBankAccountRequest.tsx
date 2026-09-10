import React, { useMemo } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFormBuilder from '../../hooks/useFormBuilder';
import useSetProgress from '../../hooks/useSetProgress';
import classNames from 'classnames';
import FormGroup from '../elements/forms/elements/FormGroup';
import FormValuesModel from '../../types/FormValuesModel';
import { ApiResponseSingle, ResponseError } from '../../props/ApiResponses';
import BankConnection from '../../props/models/BankConnection';
import usePushApiError from '../../hooks/usePushApiError';
import Bank from '../../props/models/Bank';
import SelectControl from '../elements/select-control/SelectControl';
import useTranslate from '../../hooks/useTranslate';

export default function ModalBankAccountRequest({
    modal,
    bank,
    onCreated,
    storeBankConnection,
}: {
    modal: ModalState;
    bank: Bank;
    onCreated: (connection: BankConnection) => void;
    storeBankConnection: (bank: Bank, values: FormValuesModel) => Promise<ApiResponseSingle<BankConnection>>;
}) {
    const pushApiError = usePushApiError();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const accountTypes = useMemo(() => {
        return [
            { id: 'all', name: translate('modals.modal_bank_account_request.options.all') },
            { id: 'single', name: translate('modals.modal_bank_account_request.options.single') },
        ];
    }, [translate]);

    const form = useFormBuilder({ account_type: 'all', iban: '' }, () => {
        setProgress(0);
        modal.setProcessing(true);

        return storeBankConnection(bank, { iban: form.values.account_type === 'single' ? form.values.iban : null })
            .then((res) => {
                modal.setProcessing(false);
                onCreated(res?.data?.data);
                modal.close();
            })
            .catch((err: ResponseError) => {
                modal.setProcessing(false);
                form.setErrors(err?.data?.errors);
                form.setIsLocked(false);
                pushApiError(err);
            })
            .finally(() => setProgress(100));
    });

    return (
        <div className={classNames('modal', 'modal-md', 'modal-animated', modal.loading && 'modal-loading')}>
            <div className="modal-backdrop" onClick={modal.close} />
            <form className="modal-window form" onSubmit={form.submit}>
                <div className="modal-close mdi mdi-close" onClick={modal.close} role="button" />
                <div className="modal-header">{translate('modals.modal_bank_account_request.title')}</div>
                <div className="modal-body">
                    <div className="modal-section">
                        <div className="modal-text">{translate('modals.modal_bank_account_request.description')}</div>
                        <FormGroup
                            label={translate('modals.modal_bank_account_request.labels.account_type')}
                            info={translate('modals.modal_bank_account_request.info.account_type')}
                            input={(id) => (
                                <SelectControl
                                    id={id}
                                    propKey="id"
                                    className="form-control"
                                    value={form.values.account_type}
                                    options={accountTypes}
                                    onChange={(account_type?: string) => {
                                        form.update({ account_type });
                                    }}
                                />
                            )}
                        />

                        {form.values.account_type === 'single' && (
                            <FormGroup
                                required={true}
                                label={translate('modals.modal_bank_account_request.labels.iban')}
                                info={translate('modals.modal_bank_account_request.info.iban')}
                                error={form.errors?.iban}
                                input={(id) => (
                                    <input
                                        type="text"
                                        value={form.values.iban}
                                        placeholder={translate('modals.modal_bank_account_request.placeholders.iban')}
                                        id={id}
                                        className="form-control"
                                        onChange={(e) => form.update({ iban: e.target.value })}
                                    />
                                )}
                            />
                        )}
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button
                        type="button"
                        className="button button-default"
                        disabled={form.isLoading}
                        onClick={modal.close}>
                        Annuleren
                    </button>
                    <button
                        className="button button-primary"
                        disabled={form.isLoading || (form.values.account_type === 'single' && !form.values.iban)}
                        type="submit">
                        {form.isLoading && <em className="mdi mdi-loading mdi-spin icon-start" />}
                        Bevestigen
                    </button>
                </div>
            </form>
        </div>
    );
}
