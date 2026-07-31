import React, { useMemo } from 'react';
import Fund from '../../../../props/models/Fund';
import FormBuilder from '../../../../types/FormBuilder';
import useTranslate from '../../../../hooks/useTranslate';
import { currencyFormat } from '../../../../helpers/string';
import FormGroup from '../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../elements/select-control/SelectControl';
import { PayoutAmountType, PayoutFormValues } from '../types';

export default function PayoutAmountFields({
    form,
    fund,
}: {
    form: FormBuilder<PayoutFormValues>;
    fund?: Partial<Fund>;
}) {
    const translate = useTranslate();

    const amountOptions = useMemo((): Array<{ key: PayoutAmountType; name: string }> => {
        return [
            fund?.allow_custom_amounts ? { key: 'custom', name: 'Vrij bedrag' } : null,
            fund?.allow_preset_amounts && fund?.amount_presets.length > 0
                ? { key: 'predefined', name: 'Vaste bedragen op basis van categorieën' }
                : null,
        ].filter(Boolean) as Array<{ key: PayoutAmountType; name: string }>;
    }, [fund]);

    const amountValueOptions = useMemo(() => {
        const options = fund?.allow_preset_amounts ? fund?.amount_presets : [];

        return options.map((item) => ({
            ...item,
            label: `${item.name} ${item.amount_locale}`,
        }));
    }, [fund]);

    const customAmountMin = fund?.custom_amount_min || '1';
    const customAmountMax = fund?.custom_amount_max || '2000';

    return (
        <>
            <FormGroup
                required={true}
                label={translate('modals.modal_payout_create.labels.allocate_by')}
                info={translate('modals.modal_payout_create.info.allocate_by')}
                input={(id) => (
                    <SelectControl
                        id={id}
                        value={form.values.allocate_by}
                        propKey={'key'}
                        propValue={'name'}
                        onChange={(allocate_by: PayoutAmountType) => form.update({ allocate_by })}
                        options={amountOptions}
                        allowSearch={false}
                    />
                )}
                error={form.errors?.allocate_by}
            />

            <FormGroup
                required={true}
                label={translate('modals.modal_payout_create.labels.amount')}
                info={translate('modals.modal_payout_create.info.amount')}
                hint={
                    form.values.allocate_by === 'custom'
                        ? `Minimaal ${currencyFormat(Number(customAmountMin))} en maximaal ${currencyFormat(Number(customAmountMax))}`
                        : undefined
                }
                input={(id) =>
                    form.values.allocate_by === 'custom' ? (
                        <input
                            id={id}
                            type={'number'}
                            className="form-control"
                            placeholder={translate('modals.modal_payout_create.labels.amount')}
                            data-dusk="payoutAmount"
                            value={form.values.amount || ''}
                            step=".01"
                            min={customAmountMin}
                            max={customAmountMax}
                            onChange={(e) => form.update({ amount: e.target.value })}
                        />
                    ) : (
                        <SelectControl
                            id={id}
                            value={form.values.amount_preset_id}
                            propKey={'id'}
                            propValue={'label'}
                            onChange={(amount_option_id: number) => form.update({ amount_preset_id: amount_option_id })}
                            options={amountValueOptions}
                            allowSearch={false}
                        />
                    )
                }
                error={form.values.allocate_by === 'custom' ? form.errors?.amount : form.errors?.amount_preset_id}
            />
        </>
    );
}
