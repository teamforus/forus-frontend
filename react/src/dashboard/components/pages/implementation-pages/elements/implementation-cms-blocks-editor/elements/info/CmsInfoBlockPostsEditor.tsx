import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { uniqueId, uniq } from 'lodash';
import { ResponseErrorData } from '../../../../../../../props/ApiResponses';
import useTranslate from '../../../../../../../hooks/useTranslate';
import ImplementationCmsBlockConfig from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import CmsInfoBlockPostEditor from './CmsInfoBlockPostEditor';
import { CmsBlockItemsUpdater, CmsBlockItemUpdater, ImplementationCmsBlockForm } from '../../types';
import { defaultValuesFromFields, defaultValuesHtmlFromFields } from '../../helpers/blocks';
import FormPane from '../../../../../../elements/forms/elements/FormPane';

export default function CmsInfoBlockPostsEditor({
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

    const postItemTypeConfig = useMemo(
        () => blockConfig.item_types.find((itemTypeConfig) => itemTypeConfig.key === 'post'),
        [blockConfig.item_types],
    );

    const expandPost = useCallback((uid: string) => {
        setExpandedBlockItemUids((list) => uniq([...list, uid]));
    }, []);

    const collapsePost = useCallback((uid: string) => {
        setExpandedBlockItemUids((list) => list.filter((item) => item !== uid));
    }, []);

    const addPost = useCallback(() => {
        if (!postItemTypeConfig) {
            return;
        }

        const uid = uniqueId();

        onChangeItems((items) => [
            ...items,
            {
                uid,
                item_type_key: postItemTypeConfig.key,
                values: defaultValuesFromFields(postItemTypeConfig.fields),
                values_html: defaultValuesHtmlFromFields(postItemTypeConfig.fields),
                media: {},
            },
        ]);

        expandPost(uid);
    }, [expandPost, onChangeItems, postItemTypeConfig]);

    const updatePost = useCallback(
        (itemUid: string, updater: CmsBlockItemUpdater) => {
            onChangeItems((items) => items.map((item) => (item.uid === itemUid ? updater(item) : item)));
        },
        [onChangeItems],
    );

    const deletePost = useCallback(
        (itemUid: string) => {
            onChangeItems((items) => items.filter((item) => item.uid !== itemUid));
            collapsePost(itemUid);
        },
        [collapsePost, onChangeItems],
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

    return (
        <FormPane title={translate('components.implementation_cms_block_editor.sections.posts')}>
            <SortableContext
                items={(block.items || []).map((item) => getItemSortableId(item.uid))}
                strategy={verticalListSortingStrategy}>
                {(block.items || []).map((item, index) => (
                    <CmsInfoBlockPostEditor
                        id={getItemSortableId(item.uid)}
                        key={item.uid}
                        fields={postItemTypeConfig?.fields || []}
                        item={item}
                        errors={errors}
                        blockIndex={blockIndex}
                        index={index}
                        onDelete={() => deletePost(item.uid)}
                        onChange={(updater) => updatePost(item.uid, updater)}
                        isExpanded={expandedBlockItemUids.includes(item.uid)}
                        onCollapse={() => collapsePost(item.uid)}
                        onExpand={() => expandPost(item.uid)}
                    />
                ))}
            </SortableContext>

            <div className="block-editor-actions">
                <button className="button button-primary" type="button" onClick={addPost}>
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('components.implementation_cms_block_editor.buttons.add_post')}
                </button>
            </div>
        </FormPane>
    );
}
