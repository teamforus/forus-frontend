import { useCallback, useEffect, useMemo, useState } from 'react';
import useSetProgress from '../../../../../dashboard/hooks/useSetProgress';
import useFilterNext from '../../../../../dashboard/modules/filter_next/useFilterNext';
import { NumberParam, NumericArrayParam, StringParam } from 'use-query-params';
import Organization from '../../../../../dashboard/props/models/Organization';
import { useOrganizationService } from '../../../../../dashboard/services/OrganizationService';
import Tag from '../../../../../dashboard/props/models/Tag';
import { useTagService } from '../../../../../dashboard/services/TagService';
import useAppConfigs from '../../../../hooks/useAppConfigs';

export type FundsPageType = 'funds' | 'partners';

export type FundsPageFilters = {
    q: string;
    tag_ids: number[];
    organization_ids: number[];
    page: number;
    per_page: number;
    order_by: 'order';
    order_dir: 'asc' | 'desc';
};

export default function useFundsPageFilters(pageType: FundsPageType) {
    const appConfigs = useAppConfigs();
    const tagService = useTagService();
    const organizationService = useOrganizationService();
    const setProgress = useSetProgress();

    const [tags, setTags] = useState<Array<Partial<Tag>>>(null);
    const [organizations, setOrganizations] = useState<Array<Partial<Organization>>>(null);

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

    const showPartnersPage = !!appConfigs?.show_fund_partners_page;

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
        return [filterValues.q, filterValues.organization_ids?.length, filterValues.tag_ids?.length].filter(
            (value) => value,
        ).length;
    }, [filterValues]);

    const getAvailableOrganizations = useCallback(
        (organizations: Organization[]) => {
            return organizations.filter((organization) =>
                pageType == 'partners'
                    ? organization.id !== appConfigs.organization_id
                    : organization.id === appConfigs.organization_id,
            );
        },
        [appConfigs.organization_id, pageType],
    );

    const buildFundsQuery = useCallback(
        (values: Partial<FundsPageFilters>) => {
            return {
                q: values.q ?? initialFilterValues.q,
                page: values.page ?? initialFilterValues.page,
                per_page: values.per_page ?? initialFilterValues.per_page,
                tag_ids: values.tag_ids?.length > 0 ? values.tag_ids : null,
                organization_ids: values.organization_ids?.length > 0 ? values.organization_ids : null,
                organization_scope: showPartnersPage ? (pageType === 'partners' ? 'partners' : 'own') : null,
                order_by: values.order_by ?? initialFilterValues.order_by,
                order_dir: values.order_dir ?? initialFilterValues.order_dir,
            };
        },
        [initialFilterValues, pageType, showPartnersPage],
    );

    const fundsQuery = useMemo(() => {
        return buildFundsQuery(filterValuesActive);
    }, [buildFundsQuery, filterValuesActive]);

    const fetchTags = useCallback(() => {
        setProgress(0);

        tagService
            .list({ type: 'funds', per_page: 1000 })
            .then((res) => setTags(res.data.data))
            .finally(() => setProgress(100));
    }, [tagService, setProgress]);

    const fetchOrganizations = useCallback(() => {
        setOrganizations(null);
        setProgress(0);

        organizationService
            .list({ type: 'sponsor', per_page: 500 })
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
    };
}
