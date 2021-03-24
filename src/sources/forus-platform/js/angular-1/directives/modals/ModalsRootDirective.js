let ModalsRootDirective = function($scope, $element, $timeout, ModalService, ModalRoute) {
    let routeModals = ModalRoute.modals();

    $scope.modals = ModalService.getModals();

    $scope.$watch('modals', (modals) => {
        update(modals.filter((modal => !modal.ready)));
    }, true);

    let update = (modals) => {
        modals.forEach(_modal => {
            let modal = _modal;

            modal.ready = true;
            modal.component = routeModals[modal.key].component;
            modal.componentType = require("underscore.string/dasherize")(
                routeModals[modal.key].component
            );
            modal.close = function() {
                if (typeof(modal.events.onClose) === 'function') {
                    modal.events.onClose(modal);
                }

                ModalService.close(modal);
            };
        });
    };

    angular.element('body').on('keydown.modal', function(e) {
        if (e.keyCode === 27) {
            $scope.modals.forEach(modal => {
                modal.close();
            });
        }
    });
};

module.exports = () => {
    return {
        restrict: "EA",
        controller: [
            '$scope',
            '$element',
            '$timeout',
            'ModalService',
            'ModalRoute',
            ModalsRootDirective
        ],
        templateUrl: 'assets/tpl/directives/modals-root.html'
    };
};