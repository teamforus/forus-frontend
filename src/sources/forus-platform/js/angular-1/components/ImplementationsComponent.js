let ImplementationsComponent = function(
    $state,
    $q,
    $rootScope,
    $stateParams,
    ImplementationService,
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {
            q: "",
            per_page: 15
        },
    };

    $ctrl.onPageChange = (query = {}) => {
        return $q((resolve, reject) => {
            ImplementationService.list(
                $rootScope.activeOrganization.id,
                Object.assign({}, query)
            ).then((res) => {
                resolve($ctrl.implementations = {
                    data: res.data.data,
                    meta: res.data.meta,
                });
            }, reject);
        });
    };

    $ctrl.$onInit = () => {};

    $ctrl.editImplementation = (implementation_id) => {
        $state.go('implementation-view', {
            organization_id: $rootScope.activeOrganization.id,
            id: implementation_id
        });
    }
};

module.exports = {
    bindings: {
        funds: '<',
        implementations: '<',
    },
    controller: [
        '$state',
        '$q',
        '$rootScope',
        '$stateParams',
        'ImplementationService',
        ImplementationsComponent
    ],
    templateUrl: 'assets/tpl/pages/implementations.html'
};