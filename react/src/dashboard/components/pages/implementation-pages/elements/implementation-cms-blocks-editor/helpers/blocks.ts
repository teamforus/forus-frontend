import { uniqueId } from 'lodash';
import ImplementationCmsBlock, {
    ImplementationCmsBlockItem,
    ImplementationCmsBlockValue,
} from '../../../../../../props/models/ImplementationCmsBlock';
import { ImplementationCmsBlockField } from '../../../../../../props/models/ImplementationCmsBlockConfig';
import { ImplementationCmsBlockForm, ImplementationCmsBlockItemForm } from '../types';

export function cmsBlocksToForm(
    blocks: Array<ImplementationCmsBlock> = [],
    currentBlocks: Array<ImplementationCmsBlockForm> = [],
): Array<ImplementationCmsBlockForm> {
    return blocks.map((block, blockIndex) => {
        const currentBlock = findCurrentBlock(currentBlocks, block, blockIndex);

        return {
            ...block,
            uid: currentBlock?.uid || uniqueId(),
            values: block.values || {},
            values_html: block.values_html || {},
            media: block.media || {},
            items: (block.items || []).map((item, itemIndex) => {
                const currentItem = findCurrentItem(currentBlock?.items || [], item, itemIndex);

                return {
                    ...item,
                    uid: currentItem?.uid || uniqueId(),
                    values: item.values || {},
                    values_html: item.values_html || {},
                    media: item.media || {},
                };
            }),
        };
    });
}

function findCurrentBlock(
    blocks: Array<ImplementationCmsBlockForm>,
    block: ImplementationCmsBlock,
    index: number,
): ImplementationCmsBlockForm | null {
    return (
        (block.id ? blocks.find((currentBlock) => currentBlock.id === block.id) : null) ||
        (blocks[index]?.block_type_key === block.block_type_key ? blocks[index] : null)
    );
}

function findCurrentItem(
    items: Array<ImplementationCmsBlockItemForm>,
    item: ImplementationCmsBlockItem,
    index: number,
): ImplementationCmsBlockItemForm | null {
    return (
        (item.id ? items.find((currentItem) => currentItem.id === item.id) : null) ||
        (items[index]?.item_type_key === item.item_type_key ? items[index] : null)
    );
}

export function cmsBlocksToPayload(blocks: Array<ImplementationCmsBlock>): Array<ImplementationCmsBlock> {
    return blocks.map((block) => ({
        ...(block.id ? { id: block.id } : {}),
        block_type_key: block.block_type_key,
        state: block.state,
        values: block.values || {},
        items: (block.items || []).map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            item_type_key: item.item_type_key,
            values: item.values || {},
        })),
    }));
}

function fieldDefaultValue(field: ImplementationCmsBlockField): ImplementationCmsBlockValue {
    if (field.default !== undefined) {
        return field.default;
    }

    if (field.type === 'boolean') {
        return false;
    }

    if (field.type === 'media' || field.type === 'color') {
        return null;
    }

    return '';
}

export function defaultValuesFromFields(
    fields: Array<ImplementationCmsBlockField>,
): Record<string, ImplementationCmsBlockValue> {
    return fields.reduce(
        (values, field) => ({
            ...values,
            [field.key]: fieldDefaultValue(field),
        }),
        {},
    );
}

export function defaultValuesHtmlFromFields(fields: Array<ImplementationCmsBlockField>): Record<string, string> {
    return fields.reduce<Record<string, string>>((values, field) => {
        if (field.type !== 'markdown' || field.default_html === undefined) {
            return values;
        }

        return {
            ...values,
            [field.key]: field.default_html,
        };
    }, {});
}
