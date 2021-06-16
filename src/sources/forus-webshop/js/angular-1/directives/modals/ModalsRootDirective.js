const dasherize = require("underscore.string/dasherize");

let ModalsRootDirective = function($scope, ModalService, ModalRoute) {
    let routeModals = ModalRoute.modals();

    $scope.modals = ModalService.getModals();

    angular.element('body').on('keydown.modal', function(e) {
        if (e.keyCode === 27) {
            $scope.modals.forEach(modal => {
                modal.close();
            });
        }
    });

    $scope.$watch('modals', (modals) => {
        update(modals.filter((modal => !modal.ready)));
    }, true);

    let update = (modals) => {
        modals.forEach(_modal => {
            const modal = _modal;

            modal.ready = true;
            modal.component = routeModals[modal.key].component;
            modal.componentType = dasherize(routeModals[modal.key].component);
            modal.close = function() {
                if (typeof(modal.events.onClose) === 'function') {
                    modal.events.onClose(modal);
                }

                ModalService.close(modal);
            };
        });
    };
};

module.exports = () => {
    return {
        restrict: "EA",
        controller: [
            '$scope',
            'ModalService',
            'ModalRoute',
            ModalsRootDirective
        ],
        templateUrl: 'assets/tpl/directives/modals-root.html'
    };
};
