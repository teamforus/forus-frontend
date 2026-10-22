import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import { createEnumParam, NumberParam, StringParam } from 'use-query-params';
import { useCallback, useEffect, useMemo, useState } from 'react';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import { PaginationData } from '../../../../props/ApiResponses';
import SponsorIdentity, { IdentityProviderStatusFilter } from '../../../../props/models/Sponsor/SponsorIdentity';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import Organization from '../../../../props/models/Organization';
import usePushApiError from '../../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../../hooks/useLatestRequestWithProgress';

export default function useFetchSponsorIdentities(organization: Organization, extraFilters?: { household_id: number }) {
    const pushApiError = usePushApiError();

    const paginatorService = usePaginatorService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [extra] = useState(extraFilters ?? []);
    const [paginatorKey] = useState('identities');
    const [loading, setLoading] = useState(false);
    const [identities, setIdentities] = useState<PaginationData<SponsorIdentity>>(null);

    const [states] = useState([
        { key: null, name: 'Alle' },
        { key: 'pending', name: 'In afwachting' },
        { key: 'success', name: 'Voltooid' },
    ]);

    const showProfileStatus = organization.show_identity_provider_profile_status;

    const runLatestRequest = useLatestRequestWithProgress();

    const [filterValues, filterValuesActive, filterUpdate, filter] = useFilterNext<{
        q: string;
        state: string;
        type?: SponsorIdentity['type'] | null;
        page?: number;
        city?: string;
        has_bsn?: number;
        fund_id?: number;
        identity_provider_status?: IdentityProviderStatusFilter | null;
        per_page?: number;
        postal_code?: string;
        municipality_name?: string;
        birth_date_to?: string;
        birth_date_from?: string;
        last_login_to?: string;
        last_login_from?: string;
        last_activity_to?: string;
        last_activity_from?: string;
        order_by?: string;
        order_dir?: string;
    }>(
        {
            q: '',
            state: states[0].key,
            type: null,
            fund_id: null,
            identity_provider_status: null,
            page: 1,
            city: '',
            has_bsn: null,
            postal_code: '',
            municipality_name: '',
            birth_date_to: '',
            birth_date_from: '',
            last_login_to: '',
            last_login_from: '',
            last_activity_to: '',
            last_activity_from: '',
            order_by: 'created_at',
            order_dir: 'desc',
            per_page: paginatorService.getPerPage(paginatorKey),
        },
        {
            throttledValues: ['q', 'postal_code', 'city', 'municipality_name'],
            queryParams: {
                q: StringParam,
                state: StringParam,
                type: createEnumParam<SponsorIdentity['type']>(['voucher', 'profile', 'employee']),
                page: NumberParam,
                city: StringParam,
                has_bsn: NumberParam,
                fund_id: NumberParam,
                identity_provider_status: createEnumParam<IdentityProviderStatusFilter>([
                    'managed',
                    'active',
                    'disabled',
                    'unmanaged',
                ]),
                per_page: NumberParam,
                postal_code: StringParam,
                municipality_name: StringParam,
                birth_date_to: StringParam,
                birth_date_from: StringParam,
                last_login_to: StringParam,
                last_login_from: StringParam,
                last_activity_to: StringParam,
                last_activity_from: StringParam,
                order_by: StringParam,
                order_dir: StringParam,
            },
        },
    );

    const requestFilters = useMemo(() => {
        return {
            ...filterValuesActive,
            ...extra,
            ...(!showProfileStatus && filterValuesActive.identity_provider_status
                ? { identity_provider_status: null, page: 1 }
                : {}),
        };
    }, [extra, filterValuesActive, showProfileStatus]);

    const fetchIdentities = useCallback(() => {
        runLatestRequest((config) => sponsorIdentitiesService.list(organization.id, requestFilters, config), {
            onStart: () => setLoading(true),
            onSuccess: (res) => setIdentities(res.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [runLatestRequest, sponsorIdentitiesService, organization.id, requestFilters, pushApiError]);

    useEffect(() => {
        if (!showProfileStatus && filterValues.identity_provider_status) {
            filterUpdate({ identity_provider_status: null, page: 1 });
        }
    }, [showProfileStatus, filterValues.identity_provider_status, filterUpdate]);

    return { filter, filterValues, filterUpdate, requestFilters, loading, identities, fetchIdentities, paginatorKey };
}
