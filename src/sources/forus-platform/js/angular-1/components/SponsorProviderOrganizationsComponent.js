const { pick } = require("lodash");

const SponsorProviderOrganizationsComponent = function(
    $state,
    $filter,
    $stateParams,
    FileService,
    ModalService,
    OrganizationService,
    ProviderFundService
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    $ctrl.loaded = false;

    $ctrl.orderByOptions = [{
        value: 'application_date',
        name: 'Nieuwste eerst'
    }, {
        value: 'name',
        name: 'Naam aflopend'
    }];

    $ctrl.filters = {
        show: false,
        values: pick($stateParams, [
            'q', 'order_by', 'fund_id', 'allow_budget', 'allow_products', 'has_products',
        ]),
        defaultValues: {
            q: '',
            order_by: $ctrl.orderByOptions[0].value,
            fund_id: null,
            allow_budget: '',
            allow_products: '',
            has_products: '',
        },
        reset: function() {
            this.values = { ...this.defaultValues };
            $ctrl.updateState(this.defaultValues);
        }
    };

    $ctrl.fundFilters = {};

    $ctrl.updateState = (query) => {
        $state.go(
            'sponsor-provider-organizations',
            { ...query, organization_id: $ctrl.organization.id },
            { location: 'replace' },
        );
    };

    $ctrl.onPageChange = (query) => {
        const filter = { ...query, ...{ order_dir: query.order_by == 'name' ? 'asc' : 'desc' } };

        OrganizationService.providerOrganizations($ctrl.organization.id, filter).then((res => {
            $ctrl.providerOrganizations = {
                meta: res.data.meta,
                data: $ctrl.transformList(res.data.data),
            };
            $ctrl.updateState(query);
        }));
    };

    $ctrl.onFundsPageChange = (query) => {
        ProviderFundService.listFunds(query.organization_id, {
            page: query.page,
            per_page: query.per_page,
            archived: 0,
            sponsor_organization_id: $ctrl.organization.id,
        }).then((res => {
            $ctrl.rows.find(row => row.index == query.organization_id && row.fundsBlock).data = transformFundProviderItems(res.data.data);
            
            $ctrl.rows.find(row => row.index == query.organization_id && row.paginationBlock).data = { 
                ...res.data.meta,
                organization_id: query.organization_id,
            };
        }));
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        ModalService.open('exportType', {
            success: (data) => {
                const fileName = 'providers_' + $ctrl.organization.id + '_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType;

                OrganizationService.providerOrganizationsExport($ctrl.organization.id, {
                    ...$ctrl.filters.values,
                    ...{ export_format: data.exportType }
                }).then((res => {
                    FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
                }));
            }
        });
    };


    $ctrl.hideFilters = () => $ctrl.filters.show = false;
    $ctrl.transformList = (providers) => providers.map(provider => $ctrl.transformItem(provider));

    const transformFundProviderItems = (fund_providers) => {
        return (fund_providers || []).map((fundProvider) => ({
            ...fundProvider,
            state_locale: $translate(`provider_organizations.labels.fund_provider_state.${fundProvider.state}`),
            uiViewParams: {
                fund_id: fundProvider.fund.id,
                organization_id: fundProvider.fund.organization_id,
                fund_provider_id: fundProvider.id,
            },
        }));
    };

    $ctrl.transformItem = (providerOrganization) => {
        const acceptedFunds = (providerOrganization.fund_providers.data || [])
            .filter((fund_provider) => fund_provider.state === 'accepted').length;

        const acceptedFundsLocale = acceptedFunds === 0
            ? 'geen fondsen'
            : acceptedFunds + (acceptedFunds === 1 ? ' fonds' : ' fondsen');

        return {
            ...providerOrganization,
            ...{
                uiViewParams: {
                    organization_id: $ctrl.organization.id,
                    provider_organization_id: providerOrganization.id
                },
                fund_providers: {
                    ...providerOrganization.fund_providers,
                    data: transformFundProviderItems(providerOrganization.fund_providers.data),
                },
                accepted_funds_count: acceptedFunds,
                accepted_funds_count_locale: acceptedFundsLocale,
                collapsed: false,
            }
        };
    };

    const makeTableRows = (providerOrganizations) => {
        $ctrl.rows = [];

        providerOrganizations.forEach(organization => {
            //- Main content block
            $ctrl.rows.push({
                data: organization,
                show: true,
                collapsed: false,
                mainContentBlock: true,
            });

            //- Fund details block
            $ctrl.rows.push({
                data: organization.fund_providers.data,
                index: organization.id,
                show: false,
                fundsBlock: true,
            });

            //- Pagination block
            $ctrl.rows.push({
                data: {
                    ...organization.fund_providers,
                    organization_id: organization.id,
                },
                index: organization.id,
                show: false,
                paginationBlock: true,
            });
        });
    };

    $ctrl.toggleOrganizationDetails = (tableRow) => {
        tableRow.collapsed = !tableRow.collapsed;

        // Toggle the related details section
        $ctrl.rows.filter(row => row.index == tableRow.data.id && !row.mainContentBlock).map(row => {
            row.show = tableRow.collapsed;
            return row;
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.funds = [...[{ id: null, name: 'Alle' }], ...$ctrl.funds];
        $ctrl.providerOrganizations.data = $ctrl.transformList($ctrl.providerOrganizations.data);
        makeTableRows($ctrl.providerOrganizations.data);

        $ctrl.requests = $ctrl.fundUnsubscribes.length;
        $ctrl.requestsExpired = $ctrl.fundUnsubscribes.filter((item) => item.state == 'overdue').length;
        $ctrl.requestsPending = $ctrl.fundUnsubscribes.filter((item) => item.state == 'pending').length;
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        fundUnsubscribes: '<',
        providerOrganizations: '<',
    },
    controller: [
        '$state',
        '$filter',
        '$stateParams',
        'FileService',
        'ModalService',
        'OrganizationService',
        'ProviderFundService',
        SponsorProviderOrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organizations.html'
};
