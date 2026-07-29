import { ImplementationCmsBlockValue } from './ImplementationCmsBlock';

export type ImplementationCmsBlockFieldType = 'text' | 'markdown' | 'media' | 'boolean' | 'url' | 'number' | 'color';

export type ImplementationCmsBlockFieldControl = 'select' | 'textarea';

export interface ImplementationCmsBlockFieldOption {
    value: ImplementationCmsBlockValue;
    name?: string | number;
    short_name?: string | number;
}

export interface ImplementationCmsBlockField {
    key: string;
    type: ImplementationCmsBlockFieldType;
    name?: string;
    hint?: string;
    placeholder?: string;
    preview_text?: string;
    required?: boolean;
    required_if?: [string, string | number | boolean];
    required_with?: string;
    visible_if?: [string, string | number | boolean];
    visible_if_filled?: string;
    min?: number;
    max?: number;
    default?: string | number | boolean;
    default_html?: string;
    media_type?: string;
    control?: ImplementationCmsBlockFieldControl;
    options?: Array<ImplementationCmsBlockFieldOption>;
    translatable?: boolean;
}

export interface ImplementationCmsBlockItemType {
    key: string;
    name: string;
    fields: Array<ImplementationCmsBlockField>;
}

export default interface ImplementationCmsBlockConfig {
    key: string;
    name: string;
    allowed_page_types: Array<string>;
    fields: Array<ImplementationCmsBlockField>;
    item_types: Array<ImplementationCmsBlockItemType>;
}
