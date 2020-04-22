let OrganizationProvidersComponent = function(
    $q,
    $scope,
    $state,
    $stateParams,
    $timeout,
    FundService,
    FileService,
    OrganizationService,
    PushNotificationsService
) {
    let $ctrl = this;
    let org = OrganizationService.active();

    $ctrl.loaded = false;
    $ctrl.filters = {
        show: false,
        values: {},
        reset: function () {
            this.values.allow_products = '';
            this.values.allow_budget = '';
            this.values.dismissed = false;
            this.values.q = '';
            this.values.fund_id = $ctrl.fund.id;
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.replaceProviderItems = (fundProvider, rawFundProvider) => {
        $ctrl.fundProviders.data[
            $ctrl.fundProviders.data.indexOf(fundProvider)
        ] = $ctrl.transformProvider(rawFundProvider);
    };

    $ctrl.updateProvider = (fundProvider, query) => {
        return FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id,
            query
        );
    };

    $ctrl.updateAllowBudget = function(fundProvider) {
        $ctrl.updateProvider(fundProvider, {
            allow_budget: fundProvider.allow_budget
        }).then((res) => {
            PushNotificationsService.success('Opgeslagen!');

            if (!$ctrl.filters.values.dismissed) {
                $ctrl.updateProvidersList();
            } else {
                $ctrl.replaceProviderItems(fundProvider, res.data.data);
            }
        }, console.error);
    };

    $ctrl.updateAllowProducts = function(fundProvider) {
        $ctrl.updateProvider(fundProvider, {
            allow_products: fundProvider.allow_products
        }).then((res) => {
            PushNotificationsService.success('Opgeslagen!');

            if (!$ctrl.filters.values.dismissed) {
                $ctrl.updateProvidersList();
            } else {
                $ctrl.replaceProviderItems(fundProvider, res.data.data);
            }
        }, console.error);
    };

    $ctrl.updateAllowAll = function(fundProvider) {
        fundProvider.allow_budget = fundProvider.allow_products = true;

        $ctrl.updateProvider(fundProvider, {
            allow_budget: fundProvider.allow_budget,
            allow_products: fundProvider.allow_products
        }).then((res) => {
            PushNotificationsService.success('Opgeslagen!');

            if (!$ctrl.filters.values.dismissed) {
                $ctrl.updateProvidersList();
            } else {
                $ctrl.replaceProviderItems(fundProvider, res.data.data);
            }
        }, console.error);
    };

    $ctrl.dismissProvider = function(fundProvider) {
        FundService.dismissProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id
        ).then((res) => {
            PushNotificationsService.success(
                'Verborgen!',
                "Pas de filters aan om verborgen aanbieders terug te vinden."
            );

            if (!$ctrl.filters.values.dismissed) {
                $ctrl.updateProvidersList();
            } else {
                $ctrl.fundProviders.data[
                    $ctrl.fundProviders.data.indexOf(fundProvider)
                ] = $ctrl.transformProvider(res.data.data);
            }
        });
    };

    $ctrl.updateProvidersList = function() {
        $scope.onPageChange({
            fund_id: $ctrl.fund.id,
            page: $ctrl.fundProviders.meta.current_page
        });
    };

    $scope.onPageChange = (query) => {
        return $q((resolve, reject) => {
            OrganizationService.listProviders(
                $stateParams.organization_id,
                Object.assign({}, query, $ctrl.filters.values, {
                    dismissed: $ctrl.filters.values.dismissed ? 1 : 0
                })
            ).then((res => {
                $ctrl.fundProviders = {
                    meta: res.data.meta,
                    data: $ctrl.transformProvidersList(res.data.data),
                };

                resolve($ctrl.fundProviders);
            }), reject);
        });
    };

    // Export to XLS file
    $ctrl.exportList = () => {
        OrganizationService.listProvidersExport(
            $ctrl.organization.id,
            Object.assign({}, $ctrl.filters.values, {
                dismissed: $ctrl.filters.values.dismissed ? 1 : 0
            })
        ).then((res => {
            FileService.downloadFile(
                'providers_' + org + '_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.xls',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }));
    };

    $ctrl.hideFilters = () => {
        $scope.$apply(() => {
            $ctrl.filters.show = false;
        });
    };

    $ctrl.transformProvider = (fundProvider) => {
        fundProvider.uiViewParams = {
            organization_id: fundProvider.fund.organization_id,
            fund_id: fundProvider.fund.id,
            fund_provider_id: fundProvider.id
        };

        return fundProvider;
    };

    $ctrl.transformProvidersList = (providers) => {
        return providers.map(provider => $ctrl.transformProvider(provider));
    };

    $ctrl.init = () => {
        $ctrl.resetFilters();

        $scope.onPageChange($ctrl.filters.values);
    };

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;
        $ctrl.init();
    }; 

    $ctrl.$onInit = function() {
        if ($ctrl.fund) {
            $ctrl.init();
        }
    };
};

module.exports = {
    bindings: {
        fundProviders: '<',
        organization: '<',
        funds: '<',
        fund: '<'
    },
    controller: [
        '$q',
        '$scope',
        '$state',
        '$stateParams',
        '$timeout',
        'FundService',
        'FileService',
        'OrganizationService',
        'PushNotificationsService',
        OrganizationProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-providers.html'
};
