import React, { Fragment } from 'react';
import classNames from 'classnames';
import { differenceInYears } from 'date-fns';
import FormBuilder from '../../../../../types/FormBuilder';
import { ProfileFieldGroup, ProfileGroupField } from '../../types';
import useTranslate from '../../../../../hooks/useTranslate';
import { dateFormat, dateParse } from '../../../../../helpers/dates';
import FormPane from '../../../../elements/forms/elements/FormPane';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../../elements/select-control/SelectControl';
import DatePickerControl from '../../../../elements/forms/controls/DatePickerControl';

const RECORD_INFO_KEYS: Record<string, string> = {
    given_name: 'identities.record_info.given_name',
    family_name: 'identities.record_info.family_name',
    birth_date: 'identities.record_info.birth_date',
    gender: 'identities.record_info.gender',
    marital_status: 'identities.record_info.marital_status',
    client_number: 'identities.record_info.client_number',
    house_composition: 'identities.record_info.house_composition',
    living_arrangement: 'identities.record_info.living_arrangement',
    telephone: 'identities.record_info.telephone',
    mobile: 'identities.record_info.mobile',
    city: 'identities.record_info.city',
    street: 'identities.record_info.street',
    house_number: 'identities.record_info.house_number',
    house_number_addition: 'identities.record_info.house_number_addition',
    postal_code: 'identities.record_info.postal_code',
    neighborhood_name: 'identities.record_info.neighborhood_name',
    municipality_name: 'identities.record_info.municipality_name',
};

const HALF_WIDTH_RECORD_KEYS = new Set([
    'given_name',
    'family_name',
    'birth_date',
    'gender',
    'marital_status',
    'city',
    'street',
    'house_number',
    'house_number_addition',
    'postal_code',
    'neighborhood_name',
]);

export default function ProfileRecordGroupFields({
    groups,
    form,
    showGroupPanes = true,
}: {
    groups: ProfileFieldGroup[];
    form: FormBuilder<Record<string, string | null>>;
    showGroupPanes?: boolean;
}) {
    const translate = useTranslate();

    const birthDate = dateParse(form.values.birth_date || '');
    const age = birthDate ? Math.max(differenceInYears(new Date(), birthDate), 0).toString() : '';

    return (
        <div className="flex flex-gap flex-vertical">
            {groups.map(({ group, fields }) => {
                const rows: ProfileGroupField[][] = [];

                for (const field of fields) {
                    const previousRow = rows.at(-1);

                    if (
                        field.key !== 'birth_date' &&
                        HALF_WIDTH_RECORD_KEYS.has(field.key) &&
                        previousRow?.length === 1 &&
                        previousRow[0].key !== 'birth_date' &&
                        HALF_WIDTH_RECORD_KEYS.has(previousRow[0].key)
                    ) {
                        previousRow.push(field);
                    } else {
                        rows.push([field]);
                    }
                }

                const groupFields = rows.map((row) => (
                    <div className="row" key={row[0].key}>
                        {row.map(({ key, name, recordType }) => (
                            <div
                                key={key}
                                className={classNames(
                                    'col col-xs-12',
                                    (fields.length > 1 || key === 'birth_date') && HALF_WIDTH_RECORD_KEYS.has(key)
                                        ? 'col-sm-6'
                                        : 'col-sm-12',
                                )}>
                                <FormGroup
                                    key={key}
                                    label={name}
                                    error={form.errors[key]}
                                    info={
                                        Object.hasOwn(RECORD_INFO_KEYS, key) ? translate(RECORD_INFO_KEYS[key]) : null
                                    }
                                    input={(id) =>
                                        recordType.type === 'date' ? (
                                            <DatePickerControl
                                                id={id}
                                                placeholder={name}
                                                value={dateParse(form.values[key] || '')}
                                                onChange={(date) => form.update({ [key]: dateFormat(date) })}
                                            />
                                        ) : ['select', 'select_number', 'bool'].includes(recordType.type) ? (
                                            <SelectControl
                                                id={id}
                                                propKey="value"
                                                propValue="name"
                                                value={form.values[key] || ''}
                                                options={[
                                                    { value: '', name: translate('identities.custom_records.select') },
                                                    ...(recordType.options || []),
                                                ]}
                                                placeholder={name}
                                                onChange={(value: string) => form.update({ [key]: value })}
                                            />
                                        ) : (
                                            <input
                                                id={id}
                                                className="form-control"
                                                placeholder={name}
                                                value={form.values[key] ?? ''}
                                                onChange={(event) => form.update({ [key]: event.target.value })}
                                            />
                                        )
                                    }
                                />
                            </div>
                        ))}
                        {row[0].key === 'birth_date' && (
                            <div className="col col-xs-12 col-sm-6">
                                <FormGroup
                                    label={translate('identities.profile_groups.age')}
                                    info={translate('identities.record_info.age')}
                                    input={(id) => (
                                        <input id={id} className="form-control" disabled={true} value={age} />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                ));

                return showGroupPanes ? (
                    <FormPane
                        key={group?.id ?? 'fallback'}
                        title={group?.name || translate('identities.profile_groups.fallback')}>
                        {groupFields}
                    </FormPane>
                ) : (
                    <Fragment key={group?.id ?? 'fallback'}>{groupFields}</Fragment>
                );
            })}
        </div>
    );
}
