import React, { useCallback, useEffect } from 'react';
import { ResponseErrorData } from '../../../../../../../props/ApiResponses';
import { ImplementationCmsBlockField } from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { ImplementationCmsBlockValue } from '../../../../../../../props/models/ImplementationCmsBlock';
import FormGroup from '../../../../../../elements/forms/elements/FormGroup';
import CmsBlockFieldInput from './CmsBlockFieldInput';
import Media from '../../../../../../../props/models/Media';
import BlocksPerRowControl from '../field-controls/BlocksPerRowControl';
import BannerLayoutControl from '../field-controls/BannerLayoutControl';
import { CmsBlockValuesChangeEvent } from '../../types';

export default function CmsBlockFieldList({
    blockKey,
    fields,
    values,
    valuesHtml,
    media,
    errors,
    errorPrefix,
    onChangeValues,
    onChangeMedia,
}: {
    blockKey?: string;
    fields: Array<ImplementationCmsBlockField>;
    values: Record<string, ImplementationCmsBlockValue>;
    valuesHtml?: Record<string, string>;
    media?: Record<string, Media | null>;
    errors: ResponseErrorData;
    errorPrefix: string;
    onChangeValues: (e: CmsBlockValuesChangeEvent) => void;
    onChangeMedia?: (fieldKey: string, media: Media | null) => void;
}) {
    const fieldValueMatches = useCallback(
        (value: ImplementationCmsBlockValue, expected: string | number | boolean): boolean => {
            if (typeof expected === 'boolean') {
                return value === expected || value === Number(expected) || value === (expected ? '1' : '0');
            }

            return value === expected;
        },
        [],
    );

    const fieldValueIsFilled = useCallback((value: ImplementationCmsBlockValue): boolean => {
        return value !== null && value !== undefined && value !== '';
    }, []);

    const fieldIsRequired = useCallback(
        (field: ImplementationCmsBlockField) => {
            if (field.required) {
                return true;
            }

            if (field.required_if) {
                return fieldValueMatches(values[field.required_if[0]], field.required_if[1]);
            }

            if (field.required_with) {
                return fieldValueIsFilled(values[field.required_with]);
            }

            return false;
        },
        [values, fieldValueMatches, fieldValueIsFilled],
    );

    const fieldIsVisible = useCallback(
        (field: ImplementationCmsBlockField) => {
            if (field.visible_if) {
                return fieldValueMatches(values[field.visible_if[0]], field.visible_if[1]);
            }

            if (field.visible_if_filled) {
                return fieldValueIsFilled(values[field.visible_if_filled]);
            }

            return true;
        },
        [values, fieldValueMatches, fieldValueIsFilled],
    );

    const changeMedia = useCallback(
        (field: ImplementationCmsBlockField, media: Media | null) => {
            if (onChangeMedia) {
                return onChangeMedia(field.key, media);
            }

            onChangeValues({ values: { [field.key]: media?.uid || null } });
        },
        [onChangeMedia, onChangeValues],
    );

    const getCmsBlockFieldOverrideControl = useCallback((blockKey?: string, fieldKey?: string) => {
        if (`${blockKey}.${fieldKey}` === 'info.blocks_per_row') {
            return BlocksPerRowControl;
        }

        if (`${blockKey}.${fieldKey}` === 'banner.layout') {
            return BannerLayoutControl;
        }

        return null;
    }, []);

    useEffect(() => {
        const defaults = fields.reduce<Record<string, ImplementationCmsBlockValue>>((valuesToApply, field) => {
            const valueIsMissing = values[field.key] === null || values[field.key] === undefined;

            if (!fieldIsVisible(field) || !valueIsMissing || field.default === undefined) {
                return valuesToApply;
            }

            return {
                ...valuesToApply,
                [field.key]: field.default,
            };
        }, {});

        if (Object.keys(defaults).length > 0) {
            onChangeValues({ values: defaults });
        }
    }, [fieldIsVisible, fields, onChangeValues, values]);

    return fields.filter(fieldIsVisible).map((field) => {
        const OverrideControl = getCmsBlockFieldOverrideControl(blockKey, field.key);
        const placeholder = field.placeholder || '';

        return (
            <FormGroup
                key={field.key}
                label={field.type === 'media' ? null : field.name || field.key}
                hint={field.hint || ''}
                required={fieldIsRequired(field)}
                error={errors[`${errorPrefix}.${field.key}`]}
                input={(id) =>
                    OverrideControl ? (
                        <OverrideControl
                            id={id}
                            field={field}
                            value={values[field.key]}
                            valueHtml={valuesHtml?.[field.key]}
                            media={media?.[field.key]}
                            placeholder={placeholder}
                            onChange={(value) => onChangeValues({ values: { [field.key]: value } })}
                            onChangeMedia={(media) => changeMedia(field, media)}
                        />
                    ) : (
                        <CmsBlockFieldInput
                            id={id}
                            field={field}
                            value={values[field.key]}
                            valueHtml={valuesHtml?.[field.key]}
                            media={media?.[field.key]}
                            placeholder={placeholder}
                            onChange={(e) => {
                                onChangeValues({
                                    values: { [field.key]: e.value },
                                    ...(e.valueHtml !== undefined ? { valuesHtml: { [field.key]: e.valueHtml } } : {}),
                                });
                            }}
                            onChangeMedia={(media) => changeMedia(field, media)}
                        />
                    )
                }
            />
        );
    });
}
