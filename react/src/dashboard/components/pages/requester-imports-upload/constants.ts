import { ConfigurableTableColumn } from '../vouchers/hooks/useConfigurableTable';
import { LabelType } from '../../elements/label/Label';
import { RequesterImportPreviewOutcome, RequesterImportRecordChange } from '../../../props/models/RequesterImportRow';
import { RequesterImportUploadOutcome } from './types';

export const resultLabelTypes: Record<RequesterImportUploadOutcome['status'], LabelType> = {
    created: 'success',
    updated: 'primary',
    unchanged: 'default',
    skipped: 'default',
    failed: 'danger',
    unknown: 'warning',
    unsubmitted: 'default',
};

export const previewLabelTypes: Record<RequesterImportPreviewOutcome['action'], LabelType> = {
    create: 'success',
    update: 'primary',
    unchanged: 'default',
};

export const changeLabelTypes: Record<RequesterImportRecordChange['action'], LabelType> = {
    add: 'success',
    update: 'primary',
    clear: 'warning',
};

export const previewColumns: ConfigurableTableColumn[] = [
    {
        key: 'row',
        label: 'requester_imports.labels.row',
        tooltip: {
            key: 'row',
            title: 'requester_imports.labels.row',
            description: 'requester_imports.upload.preview.columns.row',
        },
    },
    {
        key: 'bsn',
        label: 'requester_imports.labels.bsn',
        tooltip: {
            key: 'bsn',
            title: 'requester_imports.labels.bsn',
            description: 'requester_imports.upload.preview.columns.bsn',
        },
    },
    {
        key: 'action',
        label: 'requester_imports.upload.preview.expected',
        tooltip: {
            key: 'action',
            title: 'requester_imports.upload.preview.expected',
            description: 'requester_imports.upload.preview.columns.expected',
        },
    },
];

export const changeColumns: ConfigurableTableColumn[] = [
    { key: 'field', label: 'requester_imports.upload.preview.field' },
    { key: 'current', label: 'requester_imports.upload.preview.current' },
    { key: 'uploaded', label: 'requester_imports.upload.preview.uploaded' },
    { key: 'action', label: 'requester_imports.upload.preview.action', headerClassName: 'text-right' },
];

export const resultColumns: ConfigurableTableColumn[] = [
    ...previewColumns.slice(0, 2),
    {
        key: 'result',
        label: 'requester_imports.labels.result',
        tooltip: {
            key: 'result',
            title: 'requester_imports.labels.result',
            description: 'requester_imports.upload.results.column_description',
        },
    },
];

export const savedChangeColumns: ConfigurableTableColumn[] = [
    { key: 'field', label: 'requester_imports.upload.preview.field' },
    { key: 'previous', label: 'requester_imports.upload.results.previous' },
    { key: 'saved', label: 'requester_imports.upload.results.saved' },
    { key: 'action', label: 'requester_imports.upload.preview.action', headerClassName: 'text-right' },
];
