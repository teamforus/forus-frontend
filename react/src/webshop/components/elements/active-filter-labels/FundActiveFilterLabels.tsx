import React, { Fragment, useCallback, useMemo } from 'react';
import Organization from '../../../../dashboard/props/models/Organization';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import Label from '../label/Label';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import { FilterModel, FilterScope } from '../../../../dashboard/modules/filter_next/types/FilterParams';
import { FundsPageFilters } from '../../pages/funds/hooks/useFundsPageFilters';
import Tag from '../../../../dashboard/props/models/Tag';

type ActiveFilterLabelType = 'all' | 'tag' | 'organization';

type ActiveFilterLabel = {
    key?: string | number;
    type: ActiveFilterLabelType;
    label: string;
};

const resetKeysMap: Record<ActiveFilterLabelType, Array<string>> = {
    all: [],
    tag: ['tag_ids'],
    organization: ['organization_ids'],
};

export default function FundActiveFilterLabels({
    filter,
    tags,
    organizations,
    initialValues,
}: {
    filter: FilterScope<FundsPageFilters>;
    tags: Array<Partial<Tag>>;
    organizations?: Array<Partial<Organization>>;
    initialValues?: Partial<FilterModel & FundsPageFilters>;
}) {
    const translate = useTranslate();

    const makeLabel = useCallback(
        (type: ActiveFilterLabelType, firstValue?: string | number): string => {
            if (type === 'tag') {
                return tags?.find((tag) => tag.id === firstValue)?.name || '';
            }

            if (type === 'organization') {
                return organizations?.find((organization) => organization.id === firstValue)?.name || '';
            }

            if (type === 'all') {
                return translate('funds.active_filters.reset_all');
            }

            return '';
        },
        [organizations, tags, translate],
    );

    const labels = useMemo<Array<ActiveFilterLabel>>(() => {
        const labels = [];

        const pushLabel = (type: ActiveFilterLabelType, key?: string | number, label?: string) => {
            if (!label) {
                return;
            }

            labels.push({ type, key, label });
        };

        filter.activeValues.tag_ids?.forEach((id) => {
            pushLabel('tag', id, makeLabel('tag', id));
        });

        filter.activeValues.organization_ids?.forEach((id) => {
            pushLabel('organization', id, makeLabel('organization', id));
        });

        if (labels.length) {
            labels.sort((a, b) => a.label.length - b.label.length);
            labels.unshift({ type: 'all', key: null, label: makeLabel('all') });
        }

        return labels;
    }, [filter.activeValues, makeLabel]);

    const resetLabel = useCallback(
        (label: ActiveFilterLabel) => {
            if (label.type === 'tag') {
                filter.update({
                    tag_ids: filter.activeValues.tag_ids?.filter((id) => id !== label.key) || [],
                });
            }

            if (label.type === 'organization') {
                filter.update({
                    organization_ids: filter.activeValues.organization_ids?.filter((id) => id !== label.key) || [],
                });
            }

            if (label.type === 'all') {
                if (initialValues) {
                    filter.update(
                        labels
                            .filter((item) => item.type !== 'all')
                            .flatMap((item) => resetKeysMap[item.type])
                            .reduce<Partial<FilterModel & FundsPageFilters>>((values, key) => {
                                if (key in initialValues) {
                                    values[key] = initialValues[key];
                                }

                                return values;
                            }, {}),
                    );
                } else {
                    filter.resetFilters();
                }
            }
        },
        [filter, initialValues, labels],
    );

    if (labels.length === 0) {
        return null;
    }

    return (
        <div className="showcase-aside-group">
            <div className="showcase-aside-group-title">{translate('products.filters.active_filters')}</div>

            <div className="label-group">
                {labels.map((label, index) => (
                    <Label
                        key={index}
                        type={`${label.type === 'all' ? 'light' : 'primary'}`}
                        size="md"
                        dusk={`activeFilter_${label.type}_${label.key || ''}`}>
                        <Fragment>
                            <span>{label.label}</span>
                            <em
                                className="mdi mdi-close clickable"
                                data-dusk="closeActiveFilter"
                                tabIndex={0}
                                onKeyDown={clickOnKeyEnter}
                                role="button"
                                onClick={() => resetLabel(label)}
                            />
                        </Fragment>
                    </Label>
                ))}
            </div>
        </div>
    );
}
