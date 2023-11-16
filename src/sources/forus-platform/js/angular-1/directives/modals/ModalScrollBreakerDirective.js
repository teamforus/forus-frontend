module.exports = [function () {
    let ModalScrollBrakeDirective = function($scope, $element, ModalService) {
        $scope.modals = ModalService.getModals();

        $scope.$watch('modals', (modals) => {
            $element.css('overflow', modals && modals.length > 0 ? 'hidden' : 'auto');
        }, true);
    };

    return {
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            'ModalService',
            ModalScrollBrakeDirective
        ]
    };
}];