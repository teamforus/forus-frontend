const ProviderItemDirective = function($scope) {
    const $dir = $scope.$dir = {};

    $dir.toggleOffices = (e) => {
        e.preventDefault();
        e.stopPropagation();

        $dir.provider.showOffices = !$dir.provider.showOffices;
    }

    $dir.media = $scope.provider.logo || null;
    $dir.provider = $scope.provider;

    $dir.provider.offices = $dir.provider.offices.map((office) => {
        const uiSrefParams = {
            provider_id: office.organization_id,
            office_id: office.id
        };

        return { ...office, ...{ uiSrefParams } };
    });
};

module.exports = () => {
    return {
        scope: {
            provider: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            ProviderItemDirective
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/providers/' + ($attr.template || 'provider-item-list') + '.html'
        }
    };
};
