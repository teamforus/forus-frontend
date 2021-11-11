const ImplementationsComponent = function(
    $q,
    $state,
    $rootScope,
    ImplementationService,
) {
    const $ctrl = this;

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
            ).then((res) => resolve($ctrl.implementations = {
                data: res.data.data,
                meta: res.data.meta,
            }), reject);
        });
    };

    $ctrl.$onInit = () => {
        if ($ctrl.implementations.meta.total == 1) {
            $ctrl.editImplementation($ctrl.implementations.data[0].id);
        }
    };

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
        '$q',
        '$state',
        '$rootScope',
        'ImplementationService',
        ImplementationsComponent
    ],
    templateUrl: 'assets/tpl/pages/implementations.html'
};