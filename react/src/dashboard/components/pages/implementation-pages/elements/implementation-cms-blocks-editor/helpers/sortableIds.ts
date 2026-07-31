import type { UniqueIdentifier } from '@dnd-kit/core';

const CMS_BLOCK_SORTABLE_ID_PREFIX = 'block:';
const CMS_BLOCK_ITEM_SORTABLE_ID_PREFIX = 'item:';

export function cmsBlockSortableId(uid: string): string {
    return `${CMS_BLOCK_SORTABLE_ID_PREFIX}${uid}`;
}

export function cmsBlockUidFromSortableId(id: UniqueIdentifier): string | null {
    const value = String(id);

    return value.startsWith(CMS_BLOCK_SORTABLE_ID_PREFIX) ? value.slice(CMS_BLOCK_SORTABLE_ID_PREFIX.length) : null;
}

export function cmsBlockItemSortableId(blockUid: string, itemUid: string): string {
    return `${CMS_BLOCK_ITEM_SORTABLE_ID_PREFIX}${blockUid}:${itemUid}`;
}

export function cmsBlockItemDataFromSortableId(id: UniqueIdentifier): { blockUid: string; itemUid: string } | null {
    const value = String(id);
    const match = value.startsWith(CMS_BLOCK_ITEM_SORTABLE_ID_PREFIX)
        ? value.slice(CMS_BLOCK_ITEM_SORTABLE_ID_PREFIX.length).match(/^([^:]+):(.+)$/)
        : null;

    return match ? { blockUid: match[1], itemUid: match[2] } : null;
}
