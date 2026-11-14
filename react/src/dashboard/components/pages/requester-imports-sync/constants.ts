import { ConfigurableTableColumn } from '../vouchers/hooks/useConfigurableTable';
import { LabelType } from '../../elements/label/Label';
import { RequesterImportSyncPreview } from '../../../props/models/RequesterImportRow';
import { RequesterImportSyncResult } from './types';

export const syncPreviewLabelTypes: Record<RequesterImportSyncPreview['action'], LabelType> = {
    create: 'success',
    update: 'primary',
    unchanged: 'default',
    blocked: 'danger',
};

export const syncChangeLabelTypes: Record<RequesterImportSyncPreview['changes'][number]['action'], LabelType> = {
    add: 'success',
    update: 'primary',
    clear: 'warning',
    confirm_source: 'primary-light',
};

export const syncResultLabelTypes: Record<RequesterImportSyncResult['status'], LabelType> = {
    created: 'success',
    updated: 'primary',
    unchanged: 'default',
    failed: 'danger',
    skipped: 'default',
};

export const syncResultColumns: ConfigurableTableColumn[] = [
    {
        key: 'requester',
        label: 'requester_imports.sync_page.requester',
        tooltip: {
            key: 'requester',
            title: 'requester_imports.sync_page.requester',
            description: 'requester_imports.sync_page.columns.requester',
        },
    },
    {
        key: 'profile',
        label: 'requester_imports.sync.profile',
        tooltip: {
            key: 'profile',
            title: 'requester_imports.sync.profile',
            description: 'requester_imports.sync_page.columns.profile',
        },
    },
    {
        key: 'fields_updated',
        label: 'requester_imports.sync.fields_updated',
        tooltip: {
            key: 'fields_updated',
            title: 'requester_imports.sync.fields_updated',
            description: 'requester_imports.sync_page.columns.fields_updated',
        },
    },
    {
        key: 'result',
        label: 'requester_imports.labels.result',
        tooltip: {
            key: 'result',
            title: 'requester_imports.labels.result',
            description: 'requester_imports.sync_page.columns.result',
        },
    },
];

export const syncPreviewColumns: ConfigurableTableColumn[] = [
    ...syncResultColumns.slice(0, 2),
    {
        key: 'action',
        label: 'requester_imports.sync_page.preview.expected',
        tooltip: {
            key: 'action',
            title: 'requester_imports.sync_page.preview.expected',
            description: 'requester_imports.sync_page.preview.expected_description',
        },
    },
];

export const syncChangeColumns: ConfigurableTableColumn[] = [
    { key: 'field', label: 'requester_imports.upload.preview.field' },
    { key: 'current', label: 'requester_imports.sync_page.preview.current' },
    { key: 'imported', label: 'requester_imports.sync_page.preview.imported' },
    { key: 'action', label: 'requester_imports.upload.preview.action', headerClassName: 'text-right' },
];
