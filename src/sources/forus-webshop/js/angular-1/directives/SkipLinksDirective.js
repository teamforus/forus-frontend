const SkipLinksDirective = function($scope, $state) {
    $scope.mainContentUrl = '';

    $scope.$watch(() => $state.$current.name, () => {
        $scope.mainContentUrl = $state.href($state.current.name, $state.params) + '#main-content';
    });
};

module.exports = () => {
    return {
        scope: {},
        restrict: "E",
        replace: true,
        controller: [
            '$scope',
            '$state',
            SkipLinksDirective
        ],
        templateUrl: 'assets/tpl/directives/skip-links.html'
    };
};