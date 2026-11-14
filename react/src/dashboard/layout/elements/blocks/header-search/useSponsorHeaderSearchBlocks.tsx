import { useMemo } from 'react';
import Organization, { Permission } from '../../../../props/models/Organization';
import { hasPermission } from '../../../../helpers/utils';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useSponsorIdentitiesService from '../../../../services/SponsorIdentitesService';
import useHouseholdsService from '../../../../services/HouseholdsService';
import { useOrganizationService } from '../../../../services/OrganizationService';
import useProductService from '../../../../services/ProductService';
import useVoucherService from '../../../../services/VoucherService';
import { useFundRequestValidatorService } from '../../../../services/FundRequestValidatorService';
import { HeaderSearchBlockConfig, joinValues } from './HeaderSearchBlock';

export default function useSponsorHeaderSearchBlocks(organization?: Organization): Array<HeaderSearchBlockConfig> {
    const appConfigs = useAppConfigs();

    const sponsorIdentitiesService = useSponsorIdentitiesService();
    const householdsService = useHouseholdsService();
    const organizationService = useOrganizationService();
    const productService = useProductService();
    const voucherService = useVoucherService();
    const fundRequestService = useFundRequestValidatorService();

    const fundRequestsEnabled = !!appConfigs?.organizations?.funds?.fund_requests;

    return useMemo(() => {
        if (!organization) {
            return [];
        }

        const organizationId = organization.id;

        const blocks: Array<HeaderSearchBlockConfig> = [
            {
                key: 'identities',
                title: 'Personen',
                icon: 'mdi-account-outline',
                listRoute: DashboardRoutes.IDENTITIES,
                show:
                    organization.allow_profiles &&
                    hasPermission(organization, [Permission.VIEW_IDENTITIES, Permission.MANAGE_IDENTITIES]),
                fetch: (query, config) => {
                    return sponsorIdentitiesService.list(organizationId, query, config).then((res) => ({
                        total: res.data.meta.total,
                        items: res.data.data.map((identity) => ({
                            id: identity.id,
                            title:
                                [
                                    identity.records?.given_name?.[0]?.value_locale,
                                    identity.records?.family_name?.[0]?.value_locale,
                                ]
                                    .filter(Boolean)
                                    .join(' ') ||
                                identity.email ||
                                `#${identity.id}`,
                            subtitle: identity.records?.birth_date?.[0]?.value_locale,
                            route: { name: DashboardRoutes.IDENTITY, params: { organizationId, id: identity.id } },
                        })),
                    }));
                },
            },
            {
                key: 'households',
                title: 'Huishoudens',
                icon: 'mdi-home',
                listRoute: DashboardRoutes.HOUSEHOLDS,
                show:
                    organization.allow_profiles_households &&
                    hasPermission(organization, [Permission.VIEW_IDENTITIES, Permission.MANAGE_IDENTITIES]),
                fetch: (query, config) => {
                    return householdsService.list(organizationId, query, config).then((res) => ({
                        total: res.data.meta.total,
                        items: res.data.data.map((household) => {
                            const people = household.count_people
                                ? `${household.count_people} ${household.count_people === 1 ? 'persoon' : 'personen'}`
                                : null;

                            const houseNumber = [household.house_nr, household.house_nr_addition]
                                .filter(Boolean)
                                .join(' ');

                            return {
                                id: household.id,
                                title: household.uid || `Huishouden #${household.id}`,
                                subtitle: joinValues([
                                    people,
                                    [household.street, houseNumber].filter(Boolean).join(' '),
                                    household.city,
                                ]),
                                route: {
                                    name: DashboardRoutes.HOUSEHOLD,
                                    params: { organizationId, id: household.id },
                                },
                            };
                        }),
                    }));
                },
            },
            {
                key: 'providers',
                title: 'Aanbieders',
                icon: 'mdi-storefront-outline',
                listRoute: DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS,
                listQuery: { state_group: 'active' },
                show: hasPermission(organization, Permission.MANAGE_PROVIDERS),
                fetch: (query, config) => {
                    return organizationService
                        .providerOrganizations(organizationId, { ...query, state_group: 'active' }, config)
                        .then((res) => ({
                            total: res.data.meta.total,
                            items: res.data.data.map((provider) => ({
                                id: provider.id,
                                title: provider.name,
                                subtitle: provider.business_type?.name,
                                route: {
                                    name: DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION,
                                    params: { organizationId, id: provider.id },
                                },
                            })),
                        }));
                },
            },
            {
                key: 'products',
                title: 'Aanbod',
                icon: 'mdi-tag',
                listRoute: DashboardRoutes.SPONSOR_PRODUCTS,
                show: organization.allow_product_updates && hasPermission(organization, Permission.MANAGE_PROVIDERS),
                fetch: (query, config) => {
                    return productService.sponsorProducts(organizationId, query, config).then((res) => ({
                        total: res.data.meta.total,
                        items: res.data.data.map((product) => ({
                            id: product.id,
                            title: product.name,
                            route: {
                                name: DashboardRoutes.SPONSOR_PRODUCT,
                                params: { organizationId, productId: product.id },
                            },
                        })),
                    }));
                },
            },
            {
                key: 'vouchers',
                title: 'Tegoeden',
                icon: 'mdi-file-document-outline',
                listRoute: DashboardRoutes.VOUCHERS,
                show: hasPermission(organization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]),
                fetch: (query, config) => {
                    return voucherService
                        .index(organizationId, { ...query, type: 'all', source: 'all', order_dir: 'desc' }, config)
                        .then((res) => ({
                            total: res.data.meta.total,
                            items: res.data.data.map((voucher) => ({
                                id: voucher.id,
                                title: `Tegoed #${voucher.id}`,
                                subtitle: joinValues([
                                    voucher.number,
                                    voucher.fund?.name,
                                    voucher.expired ? 'Verlopen' : voucher.state_locale,
                                ]),
                                route: { name: DashboardRoutes.VOUCHER, params: { organizationId, id: voucher.id } },
                            })),
                        }));
                },
            },
            {
                key: 'fund_requests',
                title: 'Aanvragen',
                icon: 'mdi-clipboard-text-outline',
                listRoute: DashboardRoutes.FUND_REQUESTS,
                show:
                    fundRequestsEnabled &&
                    hasPermission(organization, [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS]),
                fetch: (query, config) => {
                    return fundRequestService.index(organizationId, query, config).then((res) => ({
                        total: res.data.meta.total,
                        items: res.data.data.map((fundRequest) => ({
                            id: fundRequest.id,
                            title: `Aanvraag ${fundRequest.id}`,
                            subtitle: joinValues([fundRequest.email, fundRequest.fund?.name, fundRequest.state_locale]),
                            route: {
                                name: DashboardRoutes.FUND_REQUEST,
                                params: { organizationId, id: fundRequest.id },
                            },
                        })),
                    }));
                },
            },
        ];

        return blocks.filter((block) => block.show);
    }, [
        organization,
        fundRequestsEnabled,
        sponsorIdentitiesService,
        householdsService,
        organizationService,
        productService,
        voucherService,
        fundRequestService,
    ]);
}
