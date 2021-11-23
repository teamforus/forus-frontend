const SkipLinksDirective = function($scope, $state) {
    $scope.mainContentUrl = '';

    $scope.$watch(() => $state.$current.name, () => {
        $scope.mainContentUrl = $state.href($state.current.name, $state.params) + '#main-content';
    });

    $scope.focusMobileNavigation = () => {
        angular.element(document.querySelector('.block-sticky-footer')).removeClass('scrolled');
        angular.element(document.querySelector('.sticky-footer-list')).find('li')[0].focus();
    };
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