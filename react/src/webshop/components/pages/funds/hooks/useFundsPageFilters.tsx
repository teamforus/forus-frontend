import { useCallback, useEffect, useMemo, useState } from 'react';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useFilterNext from '../../../../../dashboard/modules/filter_next/useFilterNext';
import { NumberParam, NumericArrayParam, StringParam, useQueryParams } from 'use-query-params';
import Organization from '../../../../../dashboard/props/models/Organization';
import { useOrganizationService } from '../../../../../dashboard/services/OrganizationService';
import Tag from '../../../../../dashboard/props/models/Tag';
import { useTagService } from '../../../../../dashboard/services/TagService';
import {
    FilterModel,
    FilterScope,
    FilterSetter,
} from '../../../../../dashboard/modules/filter_next/types/FilterParams';
import useAppConfigs from '../../../../hooks/useAppConfigs';

export type FundsPageFilters = {
    q: string;
    tag_ids?: number[];
    organization_ids?: number[];
    page: number;
    per_page: number;
    order_by: 'order';
    order_dir?: 'asc' | 'desc';
};

type FundsPageFiltersProps = {
    countFiltersApplied: number;
    filter: FilterScope<FundsPageFilters & FilterModel>;
    filterUpdate: FilterSetter<Partial<FundsPageFilters>>;
    filterValues: Partial<FundsPageFilters & FilterModel>;
    tags: Partial<Tag>[];
    initialFilterValues: FundsPageFilters;
    fundsQuery: FundsPageFilters;
    organizations: Partial<Organization>[];
    showPartnersPage: boolean;
    pageType: 'funds' | 'partners';
};

export default function useFundsPageFilters(): FundsPageFiltersProps {
    const appConfigs = useAppConfigs();
    const tagService = useTagService();
    const organizationService = useOrganizationService();
    const setProgress = useSetProgress();

    const [{ type }] = useQueryParams({
        type: StringParam,
    });

    const [tags, setTags] = useState<Array<Partial<Tag>>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);

    const showPartnersPage = useMemo(() => appConfigs?.show_fund_partners_page, [appConfigs?.show_fund_partners_page]);

    const initialFilterValues = useMemo<FundsPageFilters>(() => {
        return {
            q: '',
            page: 1,
            tag_ids: [],
            organization_ids: [],
            per_page: 15,
            order_by: 'order',
            order_dir: 'asc',
        };
    }, []);

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<FundsPageFilters>(
        initialFilterValues,
        {
            throttledValues: ['q'],
            queryParams: {
                q: StringParam,
                tag_ids: NumericArrayParam,
                organization_ids: NumericArrayParam,
                page: NumberParam,
                per_page: NumberParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const countFiltersApplied = useMemo(() => {
        return [filterValues.q, filterValues.organization_ids.length, filterValues.tag_ids.length].filter(
            (value) => value,
        ).length;
    }, [filterValues]);

    const getAvailableOrganizations = useCallback(
        (organizations: Organization[]) => {
            return organizations.filter((organization) =>
                type == 'partners'
                    ? organization.id !== appConfigs.organization_id
                    : organization.id === appConfigs.organization_id,
            );
        },
        [appConfigs.organization_id, type],
    );

    const buildFundsQuery = useCallback(
        (values: Partial<FundsPageFilters>, availableOrganizations: Array<Partial<Organization>>) => {
            const data = {
                q: values.q,
                page: values.page,
                per_page: values.per_page,
                tag_ids: values.tag_ids?.length > 0 ? values.tag_ids : null,
                order_by: values.order_by,
                order_dir: values.order_dir,
            };

            if (showPartnersPage) {
                const availableIds = availableOrganizations.map((item) => item.id);

                const organization_ids =
                    values.organization_ids.length > 0
                        ? values.organization_ids.filter((id) => availableIds.includes(id))
                        : availableIds;

                return {
                    ...data,
                    organization_ids,
                };
            }

            return {
                ...data,
                organization_ids: values.organization_ids,
            };
        },
        [showPartnersPage],
    );

    const fetchTags = useCallback(() => {
        setProgress(0);

        tagService
            .list({ type: 'funds', per_page: 1000 })
            .then((res) => setTags(res.data.data))
            .finally(() => setProgress(100));
    }, [tagService, setProgress]);

    const fetchOrganizations = useCallback(() => {
        setProgress(0);

        organizationService
            .list({ type: 'sponsor' })
            .then((res) =>
                setOrganizations(showPartnersPage ? getAvailableOrganizations(res.data.data) : res.data.data),
            )
            .finally(() => setProgress(100));
    }, [getAvailableOrganizations, organizationService, setProgress, showPartnersPage]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const fundsQuery = useMemo(() => {
        return organizations ? buildFundsQuery(filterValuesActive, organizations) : null;
    }, [buildFundsQuery, filterValuesActive, organizations]);

    return {
        countFiltersApplied,
        filter,
        filterUpdate,
        filterValues,
        tags,
        initialFilterValues,
        fundsQuery,
        organizations,
        showPartnersPage,
        pageType: showPartnersPage && type === 'partners' ? 'partners' : 'funds',
    };
}
