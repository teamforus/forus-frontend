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
        values: {
            fund_id: $stateParams.fund_id || null,
            allow_products: '',
            allow_budget: '',
            dismissed: false,
        },
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.values.q = '';
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
            fund_id: $stateParams.fund_id,
            page: $ctrl.fundProviders.meta.current_page
        });
    };

    $scope.onPageChange = async (query) => {
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

    $ctrl.$onInit = function() {
        $ctrl.resetFilters();

        $scope.onPageChange().then(() => {
            $timeout(() => {
                $ctrl.loaded = true;
            }, 0);

            if ($ctrl.funds.length == 1) {
                $state.go('organization-providers', {
                    organization_id: $stateParams.organization_id,
                    fund_id: $ctrl.funds[0].id
                });
            }
        });
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
