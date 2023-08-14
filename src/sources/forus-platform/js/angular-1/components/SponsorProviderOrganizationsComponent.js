const { pick } = require("lodash");

const SponsorProviderOrganizationsComponent = function(
    $state,
    $stateParams,
    FileService,
    ModalService,
    OrganizationService
) {
    const $ctrl = this;

    $ctrl.loaded = false;
    $ctrl.extendedView = localStorage.getItem('sponsor_providers.extended_view') === 'true';

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

    $ctrl.updateState = (query) => {
        $state.go(
            'sponsor-provider-organizations',
            { ...query, organization_id: $ctrl.organization.id },
            { location: 'replace' },
        );
    };

    $ctrl.setExtendedView = function(extendedView) {
        localStorage.setItem('sponsor_providers.extended_view', extendedView)
        $ctrl.extendedView = extendedView;
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

    $ctrl.transformItem = (providerOrganization) => {
        const acceptedFunds = (providerOrganization.funds || [])
            .filter((fund) => fund.fund_provider_state === 'accepted').length;

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
                funds: (providerOrganization.funds || []).map((fund) => ({
                    ...fund,
                    uiViewParams: {
                        fund_id: fund.id,
                        organization_id: fund.organization_id,
                        fund_provider_id: fund.fund_provider_id
                    },
                })),
                accepted_funds_count: acceptedFunds,
                accepted_funds_count_locale: acceptedFundsLocale,
            }
        };
    };

    $ctrl.$onInit = function() {
        $ctrl.funds = [...[{ id: null, name: 'Alle' }], ...$ctrl.funds];
        $ctrl.providerOrganizations.data = $ctrl.transformList($ctrl.providerOrganizations.data);

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
        '$stateParams',
        'FileService',
        'ModalService',
        'OrganizationService',
        SponsorProviderOrganizationsComponent
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organizations.html'
};
