import Media from '../../../dashboard/props/models/Media';

export type ImplementationCmsBlockValue = string | number | boolean | null;

export interface ImplementationCmsBlockItem {
    id: number;
    item_type_key: string;
    order?: number;
    values?: Record<string, ImplementationCmsBlockValue>;
    values_html?: Record<string, string>;
    media?: Record<string, Media | null>;
}

export default interface ImplementationCmsBlock {
    id?: number;
    block_type_key: string;
    state?: 'draft' | 'public';
    order?: number;
    values?: Record<string, ImplementationCmsBlockValue>;
    values_html?: Record<string, string>;
    media?: Record<string, Media | null>;
    items?: Array<ImplementationCmsBlockItem>;
}
