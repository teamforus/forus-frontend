import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ImplementationCmsBlockField } from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { ImplementationCmsBlockValue } from '../../../../../../../props/models/ImplementationCmsBlock';
import Media from '../../../../../../../props/models/Media';

type BannerLayout =
    | 'image_left'
    | 'image_right'
    | 'image_overlay_left'
    | 'image_overlay_center'
    | 'image_overlay_right';

const bannerLayouts: Array<BannerLayout> = [
    'image_left',
    'image_right',
    'image_overlay_left',
    'image_overlay_center',
    'image_overlay_right',
];

export default function BannerLayoutControl({
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
    const previewText = field.preview_text || '';

    const layoutOptions = useMemo<Array<{ value: BannerLayout; name: string }>>(() => {
        const options = field.options
            ?.map((option) => {
                const value = String(option.value) as BannerLayout;

                return bannerLayouts.includes(value)
                    ? {
                          value,
                          name: String(option.short_name ?? option.name ?? option.value ?? ''),
                      }
                    : null;
            })
            .filter((option): option is { value: BannerLayout; name: string } => Boolean(option));

        return options?.length ? options : bannerLayouts.map((value) => ({ value, name: value }));
    }, [field.options]);

    const selectedLayout = useMemo(() => {
        const layout = String(value ?? field.default ?? 'image_left');

        return layoutOptions.some((option) => option.value === layout)
            ? (layout as BannerLayout)
            : layoutOptions[0].value;
    }, [field.default, layoutOptions, value]);

    return (
        <div id={id} className="cms-block-field-choice-control" role="group">
            {layoutOptions.map((option) => {
                return (
                    <button
                        key={option.value}
                        className={classNames(
                            'cms-block-field-choice-control-option',
                            selectedLayout === option.value && 'cms-block-field-choice-control-option-active',
                        )}
                        type="button"
                        title={option.name}
                        aria-pressed={selectedLayout === option.value}
                        onClick={() => onChange(option.value)}>
                        <svg
                            className="cms-block-field-choice-control-icon"
                            width="89"
                            height="35"
                            viewBox="0 0 89 35"
                            aria-hidden="true">
                            <rect x="0.5" y="0.5" width="88" height="34" rx="3.5" fill="#fff" stroke="currentColor" />
                            <BannerLayoutIcon layout={option.value} previewText={previewText} />
                        </svg>
                        <span className="cms-block-field-choice-control-option-label">{option.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

function BannerLayoutIcon({ layout, previewText }: { layout: BannerLayout; previewText: string }) {
    if (layout === 'image_left' || layout === 'image_right') {
        return (
            <g stroke="currentColor" strokeWidth="2">
                {layout === 'image_left' && (
                    <>
                        <rect x="11" y="11" width="26" height="13" rx="1" fill="currentColor" fillOpacity="0.2" />
                        <rect x="39" y="11" width="42" height="13" rx="1" fill="#fff" />
                        <BannerLayoutIconText x={60} previewText={previewText} />
                    </>
                )}
                {layout === 'image_right' && (
                    <>
                        <rect x="11" y="11" width="42" height="13" rx="1" fill="#fff" />
                        <BannerLayoutIconText x={32} previewText={previewText} />
                        <rect x="55" y="11" width="26" height="13" rx="1" fill="currentColor" fillOpacity="0.2" />
                    </>
                )}
            </g>
        );
    }

    return (
        <g stroke="currentColor" strokeWidth="2">
            <rect x="11" y="10" width="66" height="15" fill="currentColor" fillOpacity="0.2" stroke="none" />
            <rect x="12" y="11" width="64" height="13" rx="1" fill="none" />
            {layout === 'image_overlay_left' && (
                <BannerLayoutIconText x={20} previewText={previewText} textAnchor="start" />
            )}
            {layout === 'image_overlay_center' && <BannerLayoutIconText x={44} previewText={previewText} />}
            {layout === 'image_overlay_right' && (
                <BannerLayoutIconText x={68} previewText={previewText} textAnchor="end" />
            )}
        </g>
    );
}

function BannerLayoutIconText({
    x,
    previewText,
    textAnchor = 'middle',
}: {
    x: number;
    previewText: string;
    textAnchor?: 'start' | 'middle' | 'end';
}) {
    return (
        <text
            x={x}
            y="20"
            fill="currentColor"
            stroke="none"
            textAnchor={textAnchor}
            fontFamily="var(--base-font)"
            fontSize="7"
            fontWeight="600">
            {previewText}
        </text>
    );
}
