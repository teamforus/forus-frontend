import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { uniqueId, uniq } from 'lodash';
import { ResponseErrorData } from '../../../../../../../props/ApiResponses';
import useTranslate from '../../../../../../../hooks/useTranslate';
import ImplementationCmsBlockConfig from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { CmsBlockItemsUpdater, CmsBlockItemUpdater, ImplementationCmsBlockForm } from '../../types';
import { defaultValuesFromFields, defaultValuesHtmlFromFields } from '../../helpers/blocks';
import FormPane from '../../../../../../elements/forms/elements/FormPane';
import CmsBlockItemEditor from './CmsBlockItemEditor';

export default function CmsBlockItemsEditor({
    block,
    blockIndex,
    blockConfig,
    errors,
    onChangeItems,
    getItemSortableId,
}: {
    block: ImplementationCmsBlockForm;
    blockIndex: number;
    blockConfig: ImplementationCmsBlockConfig;
    errors: ResponseErrorData;
    onChangeItems: (updater: CmsBlockItemsUpdater) => void;
    getItemSortableId: (itemUid: string) => string;
}) {
    const translate = useTranslate();

    const [expandedBlockItemUids, setExpandedBlockItemUids] = useState<Array<string>>([]);

    const itemTypeConfigByKey = useMemo(
        () => new Map(blockConfig.item_types.map((itemTypeConfig) => [itemTypeConfig.key, itemTypeConfig])),
        [blockConfig.item_types],
    );
    const defaultItemTypeConfig = blockConfig.item_types[0];

    const expandItem = useCallback((uid: string) => {
        setExpandedBlockItemUids((list) => uniq([...list, uid]));
    }, []);

    const collapseItem = useCallback((uid: string) => {
        setExpandedBlockItemUids((list) => list.filter((item) => item !== uid));
    }, []);

    const addItem = useCallback(() => {
        if (!defaultItemTypeConfig) {
            return;
        }

        const uid = uniqueId();

        onChangeItems((items) => [
            ...items,
            {
                uid,
                item_type_key: defaultItemTypeConfig.key,
                values: defaultValuesFromFields(defaultItemTypeConfig.fields),
                values_html: defaultValuesHtmlFromFields(defaultItemTypeConfig.fields),
                media: {},
            },
        ]);

        expandItem(uid);
    }, [defaultItemTypeConfig, expandItem, onChangeItems]);

    const updateItem = useCallback(
        (itemUid: string, updater: CmsBlockItemUpdater) => {
            onChangeItems((items) => items.map((item) => (item.uid === itemUid ? updater(item) : item)));
        },
        [onChangeItems],
    );

    const deleteItem = useCallback(
        (itemUid: string) => {
            onChangeItems((items) => items.filter((item) => item.uid !== itemUid));
            collapseItem(itemUid);
        },
        [collapseItem, onChangeItems],
    );

    useEffect(() => {
        const itemUids = Object.keys(errors)
            .map((error) => error.match(new RegExp(`^cms_blocks\\.${blockIndex}\\.items\\.(\\d+)\\.`)))
            .filter((match): match is RegExpMatchArray => Boolean(match))
            .map((match) => block.items?.[Number(match[1])]?.uid)
            .filter((uid): uid is string => Boolean(uid));

        if (itemUids.length > 0) {
            setExpandedBlockItemUids((list) => uniq([...list, ...itemUids]));
        }
    }, [block.items, blockIndex, errors]);

    if (!defaultItemTypeConfig) {
        return null;
    }

    return (
        <FormPane title={translate('components.implementation_cms_block_editor.sections.items')}>
            <SortableContext
                items={(block.items || []).map((item) => getItemSortableId(item.uid))}
                strategy={verticalListSortingStrategy}>
                {(block.items || []).map((item, index) => {
                    const itemTypeConfig = itemTypeConfigByKey.get(item.item_type_key);

                    return (
                        <CmsBlockItemEditor
                            id={getItemSortableId(item.uid)}
                            key={item.uid}
                            fields={itemTypeConfig?.fields || []}
                            item={item}
                            itemTypeName={itemTypeConfig?.name}
                            errors={errors}
                            blockIndex={blockIndex}
                            index={index}
                            onDelete={() => deleteItem(item.uid)}
                            onChange={(updater) => updateItem(item.uid, updater)}
                            isExpanded={expandedBlockItemUids.includes(item.uid)}
                            onCollapse={() => collapseItem(item.uid)}
                            onExpand={() => expandItem(item.uid)}
                        />
                    );
                })}
            </SortableContext>

            <div className="block-editor-actions">
                <button className="button button-primary" type="button" onClick={addItem}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('components.implementation_cms_block_editor.buttons.add_item', {
                        item: defaultItemTypeConfig.name,
                    })}
                </button>
            </div>
        </FormPane>
    );
}
