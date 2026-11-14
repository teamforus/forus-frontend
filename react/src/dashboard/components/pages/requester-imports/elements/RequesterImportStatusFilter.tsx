import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockLabelTabs from '../../../elements/block-label-tabs/BlockLabelTabs';

export default function RequesterImportStatusFilter({
    value,
    values,
    labels,
    onChange,
}: {
    value: string;
    values: string[];
    labels: Record<string, string>;
    onChange: (value: string) => void;
}) {
    const translate = useTranslate();

    const tabs = [
        { value: 'all', label: `${translate('requester_imports.status_filter.all')} (${values.length})` },
        ...Object.entries(labels).map(([key, label]) => ({
            value: key,
            label: `${label} (${values.filter((value) => value === key).length})`,
        })),
    ];

    return (
        <div className="card-header-filters">
            <div className="block block-inline-filters">
                <div className="flex form">
                    <div>
                        <BlockLabelTabs value={value} setValue={onChange} tabs={tabs} />
                    </div>
                </div>
            </div>
        </div>
    );
}
