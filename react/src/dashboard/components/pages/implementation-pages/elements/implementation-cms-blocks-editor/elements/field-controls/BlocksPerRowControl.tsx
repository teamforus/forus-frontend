import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ImplementationCmsBlockField } from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { ImplementationCmsBlockValue } from '../../../../../../../props/models/ImplementationCmsBlock';
import Media from '../../../../../../../props/models/Media';

export default function BlocksPerRowControl({
    id,
    field,
    value,
    onChange,
}: {
    id?: string;
    field: ImplementationCmsBlockField;
    value: ImplementationCmsBlockValue;
    valueHtml?: string;
    media?: Media | null;
    placeholder: string;
    onChange: (value: ImplementationCmsBlockValue) => void;
    onChangeMedia?: (media: Media | null) => void;
}) {
    const columnOptions = useMemo<Array<{ value: number; name: string }>>(() => {
        const options = field.options
            ?.map((option) => ({
                value: Number(option.value),
                name: String(option.name ?? option.value ?? ''),
            }))
            .filter((option) => [1, 2, 3].includes(option.value));

        return options?.length
            ? options
            : [1, 2, 3].map((value) => ({
                  value,
                  name: String(value),
              }));
    }, [field.options]);

    const selectedColumnCount = useMemo(() => {
        const number = Number(value ?? field.default ?? 1);

        return columnOptions.some((option) => option.value === number) ? number : columnOptions[0].value;
    }, [columnOptions, field.default, value]);

    return (
        <div id={id} className="cms-block-field-choice-control" role="group">
            {columnOptions.map((option) => {
                return (
                    <button
                        key={option.value}
                        className={classNames(
                            'cms-block-field-choice-control-option',
                            selectedColumnCount === option.value && 'cms-block-field-choice-control-option-active',
                        )}
                        type="button"
                        title={option.name}
                        aria-pressed={selectedColumnCount === option.value}
                        onClick={() => onChange(option.value)}>
                        <svg
                            className="cms-block-field-choice-control-icon"
                            width="89"
                            height="35"
                            viewBox="0 0 89 35"
                            aria-hidden="true">
                            <rect x="0.5" y="0.5" width="88" height="34" rx="3.5" fill="#fff" stroke="currentColor" />
                            <g stroke="currentColor" fill="#fff" strokeWidth="2">
                                {option.value === 1 && <rect x="11" y="11" width="62" height="13" rx="1" />}
                                {option.value === 2 && (
                                    <>
                                        <rect x="15" y="11" width="26" height="13" rx="1" />
                                        <rect x="48" y="11" width="26" height="13" rx="1" />
                                    </>
                                )}
                                {option.value === 3 && (
                                    <>
                                        <rect x="11" y="11" width="19" height="13" rx="1" />
                                        <rect x="35" y="11" width="19" height="13" rx="1" />
                                        <rect x="59" y="11" width="19" height="13" rx="1" />
                                    </>
                                )}
                            </g>
                        </svg>
                        <span className="cms-block-field-choice-control-option-label">{option.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
