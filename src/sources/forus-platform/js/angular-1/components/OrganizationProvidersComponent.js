let OrganizationProvidersComponent = function(
    $q,
    $scope,
    FileService,
    OrganizationService,
) {
    let $ctrl = this;
    let org = OrganizationService.active();

    $ctrl.loaded = false;
    $ctrl.filters = {
        show: false,
        values: {},
        reset: function() {
            if ($ctrl.fund && $ctrl.fund.type == 'budget') {
                this.values.allow_products = '';
                this.values.allow_budget = '';
            }

            this.values.dismissed = false;
            this.values.q = '';
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $scope.onPageChange = (query) => {
        return $q((resolve, reject) => {
            OrganizationService.listProviders(
                $ctrl.organization.id,
                Object.assign({}, query, $ctrl.filters.values, {
                    dismissed: $ctrl.filters.values.dismissed ? 1 : 0,
                })
            ).then((res => {
                $ctrl.fundProviders = {
                    meta: res.data.meta,
                    data: res.data.data,
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

    $ctrl.init = () => {
        $ctrl.resetFilters();

        $scope.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = function() {
        $ctrl.init();
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
        'FileService',
        'OrganizationService',
        OrganizationProvidersComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-providers.html'
};