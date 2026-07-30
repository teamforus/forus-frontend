import ImplementationCmsBlock, {
    ImplementationCmsBlockItem,
    ImplementationCmsBlockValue,
} from '../../../../../props/models/ImplementationCmsBlock';

export type CmsBlockFieldChangeEvent = {
    value: ImplementationCmsBlockValue;
    valueHtml?: string;
};

export type CmsBlockValuesChangeEvent = {
    values: Record<string, ImplementationCmsBlockValue>;
    valuesHtml?: Record<string, string>;
};

export type ImplementationCmsBlockItemForm = ImplementationCmsBlockItem & { uid: string };

export type ImplementationCmsBlockForm = Omit<ImplementationCmsBlock, 'items'> & {
    uid: string;
    items?: Array<ImplementationCmsBlockItemForm>;
};

export type CmsBlockUpdater = (block: ImplementationCmsBlockForm) => ImplementationCmsBlockForm;

export type CmsBlockItemUpdater = (item: ImplementationCmsBlockItemForm) => ImplementationCmsBlockItemForm;

export type CmsBlockItemsUpdater = (
    items: Array<ImplementationCmsBlockItemForm>,
) => Array<ImplementationCmsBlockItemForm>;
