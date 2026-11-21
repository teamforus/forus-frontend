import { ConfigurableTableColumn } from '../vouchers/hooks/useConfigurableTable';

export const profileColumns: ConfigurableTableColumn[] = [
    {
        key: 'profile',
        label: 'vouchers.from_profiles.preview_table.profile',
        tooltip: {
            key: 'profile',
            title: 'vouchers.from_profiles.preview_table.profile',
            description: 'vouchers.from_profiles.preview_table.profile_description',
        },
    },
    {
        key: 'created',
        label: 'vouchers.from_profiles.created',
        tooltip: {
            key: 'created',
            title: 'vouchers.from_profiles.created',
            description: 'vouchers.from_profiles.preview_table.created_description',
        },
    },
    {
        key: 'skipped',
        label: 'vouchers.from_profiles.skipped',
        tooltip: {
            key: 'skipped',
            title: 'vouchers.from_profiles.skipped',
            description: 'vouchers.from_profiles.preview_table.skipped_description',
        },
    },
    {
        key: 'failed',
        label: 'vouchers.from_profiles.failed',
        tooltip: {
            key: 'failed',
            title: 'vouchers.from_profiles.failed',
            description: 'vouchers.from_profiles.preview_table.failed_description',
        },
    },
];

export const fundColumns: ConfigurableTableColumn[] = [
    {
        key: 'fund',
        label: 'vouchers.from_profiles.preview_table.fund',
        tooltip: {
            key: 'fund',
            title: 'vouchers.from_profiles.preview_table.fund',
            description: 'vouchers.from_profiles.preview_table.fund_description',
        },
    },
    {
        key: 'details',
        label: 'vouchers.from_profiles.preview_table.details',
        tooltip: {
            key: 'details',
            title: 'vouchers.from_profiles.preview_table.details',
            description: 'vouchers.from_profiles.preview_table.details_description',
        },
    },
    {
        key: 'status',
        label: 'vouchers.from_profiles.preview_table.status',
        tooltip: {
            key: 'status',
            title: 'vouchers.from_profiles.preview_table.status',
            description: 'vouchers.from_profiles.preview_table.status_description',
        },
    },
];

export const estimatedProfileColumns: ConfigurableTableColumn[] = profileColumns.map((column) => {
    if (column.key === 'profile') {
        return column;
    }

    const key = column.key === 'created' ? 'eligible' : column.key;
    const label = `vouchers.from_profiles.preview_estimate.${key}`;

    return {
        ...column,
        label,
        tooltip: {
            ...column.tooltip,
            title: label,
            description: `vouchers.from_profiles.preview_estimate.${key}_description`,
        },
    };
});
