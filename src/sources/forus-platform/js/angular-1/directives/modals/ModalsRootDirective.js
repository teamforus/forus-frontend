const kebabCase = require("lodash/kebabCase");

const ModalsRootDirective = function ($scope, ModalService, ModalRoute) {
    const modals = ModalService.getModals();
    const routeModals = ModalRoute.modals();

    const update = (modals) => {
        modals.forEach(_modal => {
            const modal = _modal;

            modal.ready = true;
            modal.onkeyDown = [];
            modal.component = routeModals[modal.key].component;
            modal.componentType = kebabCase(routeModals[modal.key].component);

            modal.close = function () {
                if (typeof modal.events.onClose === 'function') {
                    modal.events.onClose(modal);
                }

                ModalService.close(modal);
            };
        });
    };

    const keyDownListner = (e, modal, isLast) => {
        if (isLast) {
            const listners = Array.isArray(modal.onkeyDown) ? modal.onkeyDown : [modal.onkeyDown];
            const code = e.charCode || e.keyCode || 0;

            if (modal.closeOnEscape && code == 27) {
                modal.close();
            }

            listners.forEach((listner) => {
                if (typeof listner === 'function') {
                    listner(code, e);
                }
            });
        }
    };

    const updateFocus = (modals) => {
        for (let i = 0; i < modals.length; i++) {
            const modal = modals[i];
            const window = modal.getElement()[0]?.querySelector('.modal-window');
            const isLast = modals.length - 1 == i;

            if (window) {
                if (!isLast) {
                    window.removeAttribute('tabindex');
                    delete window.onkeydown;
                    continue;
                }

                window.onkeydown = (e) => keyDownListner(e, modal, isLast);
                window.setAttribute('tabindex', -1);
                window.focus();
            }
        }
    };

    $scope.modals = modals;

    $scope.$watch('modals', (modals) => {
        const modalsNotReady = modals.filter((modal) => !modal.ready);
        const modalsFocus = modals.filter((modal) => modal.ready && modal.getElement);

        update(modalsNotReady);
        updateFocus(modalsFocus);

    }, true);
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
