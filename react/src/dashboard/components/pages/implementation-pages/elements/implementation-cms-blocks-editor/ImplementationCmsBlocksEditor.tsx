import React, { useCallback, useEffect, useMemo } from 'react';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent } from '@dnd-kit/core';
import { ResponseError, ResponseErrorData } from '../../../../../props/ApiResponses';
import ModalDangerZone from '../../../../modals/ModalDangerZone';
import useOpenModal from '../../../../../hooks/useOpenModal';
import useTranslate from '../../../../../hooks/useTranslate';
import { uniq } from 'lodash';
import useImplementationPageService from '../../../../../services/ImplementationPageService';
import Implementation from '../../../../../props/models/Implementation';
import ImplementationPage from '../../../../../props/models/ImplementationPage';
import ImplementationCmsBlockConfig from '../../../../../props/models/ImplementationCmsBlockConfig';
import CmsInfoBlockPostsEditor from './elements/info/CmsInfoBlockPostsEditor';
import CmsBlockItemsEditor from './elements/items/CmsBlockItemsEditor';
import FormGroup from '../../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../../elements/select-control/SelectControl';
import CmsBlockSortablePanel from './elements/block/CmsBlockSortablePanel';
import CmsBlockFieldList from './elements/fields/CmsBlockFieldList';
import { cmsBlocksToPayload } from './helpers/blocks';
import { CmsBlockItemsUpdater, CmsBlockUpdater, CmsBlockValuesChangeEvent, ImplementationCmsBlockForm } from './types';
import Media from '../../../../../props/models/Media';
import type { ImplementationCmsBlockState } from '../../../../../props/models/ImplementationCmsBlock';
import {
    cmsBlockItemDataFromSortableId,
    cmsBlockItemSortableId,
    cmsBlockSortableId,
    cmsBlockUidFromSortableId,
} from './helpers/sortableIds';

const cmsCollisionDetection: CollisionDetection = (args) => {
    const activeBlockUid = cmsBlockUidFromSortableId(args.active.id);

    if (activeBlockUid) {
        return closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter(({ id }) => Boolean(cmsBlockUidFromSortableId(id))),
        });
    }

    const activeItem = cmsBlockItemDataFromSortableId(args.active.id);

    if (!activeItem) {
        return [];
    }

    return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(({ id }) => {
            return cmsBlockItemDataFromSortableId(id)?.blockUid === activeItem.blockUid;
        }),
    });
};

export default function ImplementationCmsBlocksEditor({
    blocks,
    setBlocks,
    errors,
    setErrors,
    validateRef,
    blockConfigs,
    implementation,
    page,
    pageType,
    expandedBlockUids,
    setExpandedBlockUids,
}: {
    blocks: Array<ImplementationCmsBlockForm>;
    setBlocks: React.Dispatch<React.SetStateAction<Array<ImplementationCmsBlockForm>>>;
    errors?: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    validateRef: React.RefObject<(() => Promise<boolean>) | null>;
    blockConfigs: Array<ImplementationCmsBlockConfig>;
    implementation: Implementation;
    page?: ImplementationPage;
    pageType: string;
    expandedBlockUids: Array<string>;
    setExpandedBlockUids: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const implementationPageService = useImplementationPageService();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const blockStates = useMemo<Array<{ value: ImplementationCmsBlockState; name: string }>>(
        () => [
            {
                value: 'draft',
                name: translate('components.implementation_cms_block_editor.states.draft'),
            },
            {
                value: 'public',
                name: translate('components.implementation_cms_block_editor.states.public'),
            },
        ],
        [translate],
    );

    const blockConfigByKey = useMemo(
        () => new Map(blockConfigs.map((blockConfig) => [blockConfig.key, blockConfig])),
        [blockConfigs],
    );
    const blockSortableIds = useMemo(() => blocks.map((block) => cmsBlockSortableId(block.uid)), [blocks]);

    const askConfirmation = useCallback(
        (onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('components.implementation_cms_block_editor.modals.delete_block.title')}
                    description={translate(
                        'components.implementation_cms_block_editor.modals.delete_block.description',
                    )}
                    buttonCancel={{
                        onClick: modal.close,
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            modal.close();
                            onConfirm();
                        },
                        text: translate('modals.danger_zone.remove_implementation_block.buttons.confirm'),
                    }}
                />
            ));
        },
        [openModal, translate],
    );

    const updateBlock = useCallback(
        (blockUid: string, updater: CmsBlockUpdater) => {
            setBlocks((blocks) => blocks.map((block) => (block.uid === blockUid ? updater(block) : block)));
        },
        [setBlocks],
    );

    const updateBlockValues = useCallback(
        (blockUid: string, e: CmsBlockValuesChangeEvent) => {
            updateBlock(blockUid, (block) => ({
                ...block,
                values: { ...(block.values || {}), ...e.values },
                ...(e.valuesHtml ? { values_html: { ...(block.values_html || {}), ...e.valuesHtml } } : {}),
            }));
        },
        [updateBlock],
    );

    const updateBlockMedia = useCallback(
        (blockUid: string, fieldKey: string, media: Media | null) => {
            updateBlock(blockUid, (block) => ({
                ...block,
                media: { ...(block.media || {}), [fieldKey]: media },
                values: { ...(block.values || {}), [fieldKey]: media?.uid || null },
            }));
        },
        [updateBlock],
    );

    const updateBlockItems = useCallback(
        (blockUid: string, updater: CmsBlockItemsUpdater) => {
            updateBlock(blockUid, (block) => ({
                ...block,
                items: updater(block.items || []),
            }));
        },
        [updateBlock],
    );

    const blockHeaderTitle = useCallback(
        (block: ImplementationCmsBlockForm, blockConfig?: ImplementationCmsBlockConfig) => {
            const typeName = blockConfig?.name || block.block_type_key;
            const title = block.values?.section_title;

            return typeof title === 'string' && title ? `${typeName}: ${title}` : typeName;
        },
        [],
    );

    const deleteBlock = useCallback(
        (blockUid: string) => {
            askConfirmation(() => {
                setBlocks((blocks) => blocks.filter((block) => block.uid !== blockUid));
                setExpandedBlockUids((list) => list.filter((uid) => uid !== blockUid));
            });
        },
        [askConfirmation, setBlocks, setExpandedBlockUids],
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const activeUid = cmsBlockUidFromSortableId(active.id);
            const overUid = cmsBlockUidFromSortableId(over.id);

            if (activeUid && overUid) {
                setBlocks((blocks) => {
                    const oldIndex = blocks.findIndex((block) => block.uid === activeUid);
                    const newIndex = blocks.findIndex((block) => block.uid === overUid);

                    return oldIndex === -1 || newIndex === -1 ? blocks : arrayMove(blocks, oldIndex, newIndex);
                });

                return;
            }

            const activeItem = cmsBlockItemDataFromSortableId(active.id);
            const overItem = cmsBlockItemDataFromSortableId(over.id);

            if (!activeItem || !overItem || activeItem.blockUid !== overItem.blockUid) {
                return;
            }

            setBlocks((blocks) => {
                return blocks.map((block) => {
                    if (block.uid !== activeItem.blockUid) {
                        return block;
                    }

                    const items = block.items || [];
                    const oldIndex = items.findIndex((item) => item.uid === activeItem.itemUid);
                    const newIndex = items.findIndex((item) => item.uid === overItem.itemUid);

                    return oldIndex === -1 || newIndex === -1
                        ? block
                        : { ...block, items: arrayMove(items, oldIndex, newIndex) };
                });
            });
        },
        [setBlocks],
    );

    const validate = useCallback(async (): Promise<boolean> => {
        try {
            await implementationPageService.validateCmsBlocks(implementation.organization_id, implementation.id, {
                cms_blocks: cmsBlocksToPayload(blocks),
                ...(page?.id ? { implementation_page_id: page.id } : { page_type: pageType }),
            });

            return true;
        } catch (err: unknown) {
            const { data, status } = err as ResponseError;
            const { errors, message } = data;

            if (errors && typeof errors == 'object') {
                setErrors(errors);

                const blockUids = Object.keys(errors)
                    .map((error) => error.match(/^cms_blocks\.(\d+)(\.|$)/))
                    .filter((match): match is RegExpMatchArray => Boolean(match))
                    .map((match) => blocks[Number(match[1])]?.uid)
                    .filter((uid): uid is string => Boolean(uid));

                setExpandedBlockUids((list) => uniq([...list, ...blockUids]));
            }

            throw status == 422
                ? translate('components.implementation_cms_block_editor.fix_validation_errors')
                : message;
        }
    }, [
        blocks,
        implementation.id,
        implementation.organization_id,
        implementationPageService,
        page?.id,
        pageType,
        setErrors,
        setExpandedBlockUids,
        translate,
    ]);

    useEffect(() => {
        validateRef.current = validate;

        return () => {
            validateRef.current = null;
        };
    }, [validateRef, validate]);

    if (blocks.length === 0) {
        return null;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={cmsCollisionDetection} onDragEnd={handleDragEnd}>
            <SortableContext items={blockSortableIds} strategy={verticalListSortingStrategy}>
                <div className="block block-implementation-blocks-editor">
                    {blocks.map((block, blockIndex) => {
                        const blockConfig = blockConfigByKey.get(block.block_type_key);

                        return (
                            <CmsBlockSortablePanel
                                key={block.uid}
                                id={cmsBlockSortableId(block.uid)}
                                title={blockHeaderTitle(block, blockConfig)}
                                isCollapsed={!expandedBlockUids.includes(block.uid)}
                                onCollapse={() =>
                                    setExpandedBlockUids((list) => list.filter((uid) => uid !== block.uid))
                                }
                                onExpand={() => setExpandedBlockUids((list) => uniq([...list, block.uid]))}
                                actions={
                                    <button
                                        className="button button-danger button-sm"
                                        type="button"
                                        onClick={() => deleteBlock(block.uid)}>
                                        <em className="mdi mdi-trash-can-outline icon-start" />
                                        {translate('components.implementation_cms_block_editor.buttons.delete_block')}
                                    </button>
                                }>
                                <div className="flex flex-vertical flex-gap-lg">
                                    <FormGroup
                                        label={translate('components.implementation_cms_block_editor.labels.state')}
                                        info={translate('components.implementation_cms_block_editor.tooltips.state')}
                                        error={errors?.[`cms_blocks.${blockIndex}.state`]}
                                        input={(id) => (
                                            <SelectControl
                                                id={id}
                                                propKey={'value'}
                                                value={block.state}
                                                options={blockStates}
                                                allowSearch={false}
                                                disabled={!blockConfig}
                                                onChange={(state: ImplementationCmsBlockState) => {
                                                    updateBlock(block.uid, (block) => ({ ...block, state }));
                                                }}
                                            />
                                        )}
                                    />

                                    {blockConfig ? (
                                        <>
                                            <CmsBlockFieldList
                                                blockKey={block.block_type_key}
                                                fields={blockConfig.fields}
                                                values={block.values || {}}
                                                valuesHtml={block.values_html || {}}
                                                media={block.media || {}}
                                                errors={errors || {}}
                                                errorPrefix={`cms_blocks.${blockIndex}.values`}
                                                onChangeValues={(e) => updateBlockValues(block.uid, e)}
                                                onChangeMedia={(fieldKey, media) => {
                                                    updateBlockMedia(block.uid, fieldKey, media);
                                                }}
                                            />

                                            {blockConfig.key === 'info' && (
                                                <CmsInfoBlockPostsEditor
                                                    block={block}
                                                    blockIndex={blockIndex}
                                                    blockConfig={blockConfig}
                                                    errors={errors || {}}
                                                    onChangeItems={(updater) => updateBlockItems(block.uid, updater)}
                                                    getItemSortableId={(itemUid) =>
                                                        cmsBlockItemSortableId(block.uid, itemUid)
                                                    }
                                                />
                                            )}

                                            {blockConfig.key !== 'info' && blockConfig.item_types.length > 0 && (
                                                <CmsBlockItemsEditor
                                                    block={block}
                                                    blockIndex={blockIndex}
                                                    blockConfig={blockConfig}
                                                    errors={errors || {}}
                                                    onChangeItems={(updater) => updateBlockItems(block.uid, updater)}
                                                    getItemSortableId={(itemUid) =>
                                                        cmsBlockItemSortableId(block.uid, itemUid)
                                                    }
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="form flex flex-gap flex-vertical">
                                            <FormGroup
                                                label={translate(
                                                    'components.implementation_cms_block_editor.labels.block_type',
                                                )}
                                                hint={translate(
                                                    'components.implementation_cms_block_editor.unsupported.config',
                                                )}
                                                error={
                                                    errors?.[`cms_blocks.${blockIndex}.block_type_key`] ||
                                                    errors?.[`cms_blocks.${blockIndex}.id`]
                                                }
                                                input={(id) => (
                                                    <input
                                                        id={id}
                                                        className="form-control"
                                                        type="text"
                                                        disabled={true}
                                                        value={block.block_type_key}
                                                    />
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CmsBlockSortablePanel>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
}
