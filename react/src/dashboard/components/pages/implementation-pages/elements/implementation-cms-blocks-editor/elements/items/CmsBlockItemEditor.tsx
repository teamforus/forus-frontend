import React, { useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResponseErrorData } from '../../../../../../../props/ApiResponses';
import useTranslate from '../../../../../../../hooks/useTranslate';
import { ImplementationCmsBlockField } from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { CmsBlockItemUpdater, CmsBlockValuesChangeEvent, ImplementationCmsBlockItemForm } from '../../types';
import CmsBlockFieldList from '../fields/CmsBlockFieldList';
import Media from '../../../../../../../props/models/Media';

export default function CmsBlockItemEditor({
    id,
    fields,
    item,
    itemTypeName,
    onChange,
    errors,
    blockIndex,
    index,
    onDelete,
    isExpanded,
    onCollapse,
    onExpand,
}: {
    id: string;
    fields: Array<ImplementationCmsBlockField>;
    item: ImplementationCmsBlockItemForm;
    itemTypeName?: string;
    onChange: (updater: CmsBlockItemUpdater) => void;
    errors: ResponseErrorData;
    blockIndex: number;
    index: number;
    onDelete: () => void;
    isExpanded: boolean;
    onCollapse: () => void;
    onExpand: () => void;
}) {
    const translate = useTranslate();

    const values = useMemo(() => item.values || {}, [item.values]);
    const title = typeof values.title === 'string' && values.title ? values.title : null;
    const errorPrefix = useMemo(() => `cms_blocks.${blockIndex}.items.${index}.values`, [blockIndex, index]);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const onChangeValues = useCallback(
        (e: CmsBlockValuesChangeEvent) => {
            onChange((currentItem) => ({
                ...currentItem,
                values: { ...(currentItem.values || {}), ...e.values },
                ...(e.valuesHtml ? { values_html: { ...(currentItem.values_html || {}), ...e.valuesHtml } } : {}),
            }));
        },
        [onChange],
    );

    const onChangeMedia = useCallback(
        (fieldKey: string, media: Media | null) => {
            onChange((currentItem) => ({
                ...currentItem,
                media: { ...(currentItem.media || {}), [fieldKey]: media },
                values: { ...(currentItem.values || {}), [fieldKey]: media?.uid || null },
            }));
        },
        [onChange],
    );

    return (
        <div className="block-item" ref={setNodeRef} style={style}>
            <div className="block-header">
                <em className="mdi mdi-dots-vertical block-drag" {...attributes} {...listeners} />

                <div className="block-title">
                    {title ||
                        translate(
                            `components.implementation_cms_block_editor.items.${!item.id ? 'new_item' : 'edit_item'}`,
                            { item: itemTypeName || item.item_type_key },
                        )}
                </div>

                <div className="block-actions">
                    {isExpanded ? (
                        <button className="button button-default button-sm" type="button" onClick={onCollapse}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            {translate('components.implementation_cms_block_editor.buttons.collapse')}
                        </button>
                    ) : (
                        <button className="button button-primary button-sm" type="button" onClick={onExpand}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            {translate('components.implementation_cms_block_editor.buttons.expand')}
                        </button>
                    )}

                    <button className="button button-danger button-sm" type="button" onClick={onDelete}>
                        <em className="mdi mdi-trash-can-outline icon-start" />
                        {translate('components.implementation_cms_block_editor.buttons.delete_item')}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="block-body">
                    <div className="flex flex-vertical flex-gap-lg">
                        <CmsBlockFieldList
                            fields={fields}
                            values={values}
                            valuesHtml={item.values_html || {}}
                            media={item.media || {}}
                            errors={errors}
                            errorPrefix={errorPrefix}
                            onChangeValues={onChangeValues}
                            onChangeMedia={onChangeMedia}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
