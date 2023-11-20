module.exports = [function () {
    const ScrollBreakerDirective = function ($scope, $element, $rootScope, ModalService) {
        $scope.modals = ModalService.getModals();

        $scope.$watch((scope) => ({
            modals: scope.modals,
            mobileMenuOpened: $rootScope.mobileMenuOpened
        }), (value) => {
            $element.css('overflow', (value?.modals?.length > 0 || value?.mobileMenuOpened) ? 'hidden' : 'auto');

            angular.element(document.querySelector('#main-content')).css('visibility', value?.mobileMenuOpened ? 'hidden' : 'visible');
        }, true);
    };

    return {
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$rootScope',
            'ModalService',
            ScrollBreakerDirective,
        ]
    };
}];