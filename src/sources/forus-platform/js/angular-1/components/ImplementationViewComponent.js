let ImplementationViewComponent = function(
    $q,
    $scope,
    $rootScope,
    FundService,
) {
    let $ctrl = this;
    $ctrl.initialFunds = [];

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.onPageChange = (query = {}) => {
        return $q((resolve, reject) => {
            FundService.list(
                $rootScope.activeOrganization.id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.funds = res.data.data);
            }, reject);
        });
    };

    $ctrl.$onInit = () => {
        console.log($ctrl);
        console.log($ctrl.funds);
        $ctrl.initialFunds = $ctrl.funds;

        $scope.$watch('$ctrl.filters.values.q', function(value) {
            $ctrl.funds = $ctrl.initialFunds.filter(fund => {
                return fund.name.toUpperCase().indexOf(value.toUpperCase()) != -1;
            });
        });
    };
};

module.exports = {
    bindings: {
        implementation: '<',
        funds: '<',
    },
    controller: [
        '$q',
        '$scope',
        '$rootScope',
        'FundService',
        ImplementationViewComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-view.html'
};