import React from 'react';
import FormGroup from '../../../elements/forms/FormGroup';
import UIControlText from '../../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { FilterScope, FilterSetter } from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import { FundsPageFilters } from '../hooks/useFundsPageFilters';
import Organization from '../../../../../dashboard/props/models/Organization';
import { ResponseErrorData } from '../../../../../dashboard/props/ApiResponses';
import FundsFilterGroupTags from './FundsFilterGroupTags';
import Tag from '../../../../../dashboard/props/models/Tag';
import FundsFilterGroupOrganizations from './FundsFilterGroupOrganizations';
import FundActiveFilterLabels from '../../../elements/active-filter-labels/FundActiveFilterLabels';

export default function FundsSidebarFilters({
    errors,
    filter,
    filterValues,
    filterUpdate,
    organizations,
    tags,
    initialFilterValues,
}: {
    errors: ResponseErrorData;
    filter: FilterScope<FundsPageFilters>;
    filterValues: Partial<FundsPageFilters>;
    filterUpdate: FilterSetter<Partial<FundsPageFilters>>;
    tags: Array<Partial<Tag>>;
    organizations: Array<Partial<Organization>>;
    initialFilterValues: Partial<FundsPageFilters>;
}) {
    const translate = useTranslate();

    return (
        <div className="showcase-aside-block">
            <FormGroup
                id={'funds_search'}
                label={translate('funds.labels.search')}
                error={errors?.q}
                input={(id) => (
                    <UIControlText
                        value={filterValues.q}
                        onChangeValue={(q: string) => filterUpdate({ q })}
                        ariaLabel={translate('funds.labels.search')}
                        id={id}
                        dataDusk="listFundsSearch"
                    />
                )}
            />

            <FundActiveFilterLabels
                filter={filter}
                tags={tags}
                organizations={organizations}
                initialValues={initialFilterValues}
            />

            <FundsFilterGroupTags
                value={filterValues?.tag_ids}
                setValue={(tag_ids) => filterUpdate({ tag_ids })}
                openByDefault={true}
                tags={tags}
            />

            {organizations?.length > 1 && (
                <FundsFilterGroupOrganizations
                    organizations={organizations}
                    value={filterValues?.organization_ids}
                    setValue={(organization_ids) => filterUpdate({ organization_ids })}
                    openByDefault={true}
                />
            )}
        </div>
    );
}
