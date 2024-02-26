const { pick } = require("lodash");

const SponsorProviderOrganizationsComponent = function (
    $state,
    $stateParams,
    FileService,
    ModalService,
    PaginatorService,
    OrganizationService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

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
            'q', 'order_by', 'fund_id', 'has_products',
            'allow_budget', 'allow_products', 'allow_extra_payments',
            'implementation_id',
        ]),
        defaultValues: {
            q: '',
            order_by: $ctrl.orderByOptions[0].value,
            implementation_id: null,
            fund_id: null,
            allow_budget: '',
            allow_products: '',
            allow_extra_payments: '',
            has_products: '',
        },
        reset: function () {
            this.values = { ...this.defaultValues };
            updateState(this.defaultValues);
        },
        hide: function () {
            this.show = false;
        },
    };

    const transformProviders = (providerOrganizations) => {
        return providerOrganizations.map((providerOrganization) => ({
            ...providerOrganization,
            uiViewParams: {
                organization_id: $ctrl.organization.id,
                provider_organization_id: providerOrganization.id
            },
        }));
    };

    const transformFundProviders = (fundProviders) => {
        return fundProviders.map((fundProvider) => ({
            ...fundProvider,
            uiViewParams: {
                fund_id: fundProvider.fund_id,
                organization_id: $ctrl.organization.id,
                fund_provider_id: fundProvider.id,
            },
        }));
    };

    const updateState = (query) => {
        $state.go(
            'sponsor-provider-organizations',
            { ...query, organization_id: $ctrl.organization.id },
            { location: 'replace' },
        );
    };

    $ctrl.onPageChange = (query) => {
        const filter = { ...query, ...{ order_dir: query.order_by == 'name' ? 'asc' : 'desc' } };

        PageLoadingBarService.setProgress(0);

        OrganizationService.providerOrganizations($ctrl.organization.id, filter).then(
            (res) => {
                $ctrl.providerOrganizations = { ...res.data, data: transformProviders(res.data.data) };
                updateState(query);
            },
            (res) => {
                PushNotificationsService.danger('Error', res?.data?.message);
            },
        ).finally(() => PageLoadingBarService.setProgress(100));
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        ModalService.open('exportType', {
            success: (data) => {
                const fileName = 'providers_' + $ctrl.organization.id + '_' + moment().format('YYYY-MM-DD HH:mm:ss') + '.' + data.exportType;

                PageLoadingBarService.setProgress(0);

                OrganizationService.providerOrganizationsExport($ctrl.organization.id, {
                    ...$ctrl.filters.values,
                    ...{ export_format: data.exportType }
                }).then(
                    (res => FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;')),
                    (res) => PushNotificationsService.danger('Error', res?.data?.message),
                ).finally(() => PageLoadingBarService.setProgress(100));
            }
        });
    };

    $ctrl.fetchProvidersOrganizations = (providerOrganization, query = {}) => {
        PageLoadingBarService.setProgress(0);

        OrganizationService.listProviders($ctrl.organization.id, query).then(
            (res) => providerOrganization.fundProviders = { ...res.data, data: transformFundProviders(res.data?.data) },
            (res) => PushNotificationsService.danger('Error', res?.data?.message),
        ).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.showProviderOrganizationFunds = (e, providerOrganization) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (providerOrganization.fundProviders) {
            delete providerOrganization.fundProviders;
            delete providerOrganization.fundProvidersFilters;
        } else {
            providerOrganization.fundProvidersFilters = {
                page: 1,
                per_page: 10,
                organization_id: providerOrganization.id,
            };

            $ctrl.fetchProvidersOrganizations(providerOrganization, providerOrganization.fundProvidersFilters);
        }
    };

    $ctrl.onProviderOrganizationFundsPageChange = (providerOrganization, query) => {
        $ctrl.fetchProvidersOrganizations(providerOrganization, query);
    };

    $ctrl.$onInit = function () {
        $ctrl.filters = PaginatorService.syncPageFilters($ctrl.filters, $ctrl.paginationPerPageKey);
        $ctrl.funds.unshift({
            id: null,
            name: 'Alle fondsen',
        });

        $ctrl.implementations.unshift({
            id: null,
            name: 'Alle implementaties',
        });
        $ctrl.providerOrganizations.data = transformProviders($ctrl.providerOrganizations.data);

        $ctrl.requests = $ctrl.fundUnsubscribes.length;
        $ctrl.requestsExpired = $ctrl.fundUnsubscribes.filter((item) => item.state == 'overdue').length;
        $ctrl.requestsPending = $ctrl.fundUnsubscribes.filter((item) => item.state == 'pending').length;
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        implementations: '<',
        fundUnsubscribes: '<',
        providerOrganizations: '<',
        paginationPerPageKey: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        'FileService',
        'ModalService',
        'PaginatorService',
        'OrganizationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        SponsorProviderOrganizationsComponent,
    ],
    templateUrl: 'assets/tpl/pages/sponsor-provider-organizations.html',
};
