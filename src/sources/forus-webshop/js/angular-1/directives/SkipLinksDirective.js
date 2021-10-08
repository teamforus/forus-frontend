let SkipLinksDirective = function($scope, $timeout, $state) {
    $scope.mainContentUrl = '';

    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        $scope.mainContentUrl = $state.href(
            $state.current.name, $state.params
        ) + '#main-content';
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
            '$timeout',
            '$state',
            SkipLinksDirective
        ],
        templateUrl: 'assets/tpl/directives/skip-links.html'
    };
};