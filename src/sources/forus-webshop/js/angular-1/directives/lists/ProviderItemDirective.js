const ProviderItemDirective = function($scope) {
    const $dir = $scope.$dir = {};

    $dir.toggleOffices = (e) => {
        e.preventDefault();
        e.stopPropagation();

        $dir.provider.showOffices = !$dir.provider.showOffices;
    }

    $dir.media = $scope.provider.logo || null;
    $dir.provider = { ...$scope.provider, showOffices: false };
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
