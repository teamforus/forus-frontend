const kebabCase = require("lodash/kebabCase");

const ModalsRootDirective = function($scope, ModalService, ModalRoute) {
    const modals = ModalService.getModals();
    const routeModals = ModalRoute.modals();

    const update = (modals) => {
        modals.forEach(_modal => {
            const modal = _modal;

            modal.ready = true;
            modal.onkeyDown = [];
            modal.component = routeModals[modal.key].component;
            modal.componentType = kebabCase(modal.component.split(/(?=[A-Z])/).join('-'));

            modal.close = function() {
                if (typeof modal.events.onClose === 'function') {
                    modal.events.onClose(modal);
                }

                ModalService.close(modal);
            };
        });
    };

    const keyDownListener = (e, modal, isLast) => {
        if (isLast) {
            const listeners = Array.isArray(modal.onkeyDown) ? modal.onkeyDown : [modal.onkeyDown];
            const code = e.charCode || e.keyCode || 0;

            if (modal.closeOnEscape && code == 27) {
                modal.close();
            }

            listeners.forEach((listener) => {
                if (typeof listener === 'function') {
                    listener(code, e);
                }
            });
        }
    };

    const updateModalFocus = ()=> {
        const modal = modals[modals.length - 1];

        if (typeof modal.getElement !== 'function') {
            return;
        }

        const window = modal.getElement()[0]?.querySelector('.modal');
        const focusElements = window.querySelectorAll('select, textarea, input, button, .button');
        const focusedElement = window.querySelector(':focus');

        if (!focusedElement || (focusedElement == focusElements[focusElements.length - 1])) {
            window.focus();
        }
    };

    const updateActiveWindow = (modals) => {
        for (let i = 0; i < modals.length; i++) {
            const modal = modals[i];
            const window = modal.getElement()[0]?.querySelector('.modal');
            const isLast = modals.length - 1 == i;

            if (window) {
                if (!isLast) {
                    window.removeAttribute('tabindex');
                    delete window.onkeydown;
                    continue;
                }

                window.onkeydown = (e) => keyDownListener(e, modal, isLast);
                window.setAttribute('tabindex', -1);
                updateModalFocus();
            }
        }
    };

    $scope.modals = modals;

    $scope.$watch('modals', (modals) => {
        const modalsNotReady = modals.filter((modal) => !modal.ready);
        const modalsFocus = modals.filter((modal) => modal.ready && modal.getElement);

        update(modalsNotReady);
        updateActiveWindow(modalsFocus);
    }, true);

    const onInit = () => {
        document.addEventListener('keydown', (e) => {
            if (e.key == 'Tab' && $scope.modals.length > 0) {
                updateModalFocus();
            }
        });
    };

    onInit();
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
