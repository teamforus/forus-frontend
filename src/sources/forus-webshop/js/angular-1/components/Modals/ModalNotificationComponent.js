const ModalNotificationComponent = function(
    $filter,
    $timeout,
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    $ctrl.showCloseBtn = false;
    $ctrl.showCancelBtn = false;
    $ctrl.showConfirmBtn = false;

    $ctrl.confirmBtnText = $translate('modal.buttons.confirm');
    $ctrl.closeBtnText = $translate('modal.buttons.close');
    $ctrl.cancelBtnText = $translate('modal.buttons.cancel');

    $ctrl.$onInit = () => {
        const type = $ctrl.modal.scope.type;

        $ctrl.modalClass = $ctrl.modal.scope.modalClass || '';

        $ctrl.title = $ctrl.modal.scope.title || $ctrl.modal.scope.header;
        $ctrl.header = $ctrl.modal.scope.header;
        $ctrl.notice = $ctrl.modal.scope.notice;
        $ctrl.email = $ctrl.modal.scope.email
        $ctrl.description = $ctrl.modal.scope.description;
        $ctrl.descriptionIsArray = Array.isArray($ctrl.description);
        $ctrl.mdiIconClass = $ctrl.modal.scope.mdiIconClass || null;
        $ctrl.mdiIconType = $ctrl.modal.scope.mdiIconType || '';

        $ctrl.confirmBtnText = $ctrl.modal.scope.confirmBtnText ? $ctrl.modal.scope.confirmBtnText : $ctrl.confirmBtnText;
        $ctrl.closeBtnText = $ctrl.modal.scope.closeBtnText ? $ctrl.modal.scope.closeBtnText : $ctrl.closeBtnText;
        $ctrl.cancelBtnText = $ctrl.modal.scope.cancelBtnText ? $ctrl.modal.scope.cancelBtnText : $ctrl.cancelBtnText;

        switch (type) {
            case 'info': {
                $ctrl.showCloseBtn = true;
            }; break;
            case 'danger': {
                $ctrl.showCancelBtn = true;
            }; break;
            case 'confirm': {
                $ctrl.showCancelBtn = true;
                $ctrl.showConfirmBtn = true;
            }; break;
            case 'action-result': {
                $ctrl.showConfirmBtn = true;
            }; break;
            default: {
                $ctrl.showCloseBtn = true;
            }
        }

        $timeout(() => {
            let btn = null;

            switch (type) {
                case 'info': {
                    btn = document.querySelector('[data-close]');
                }; break;
                case 'confirm':
                case 'action-result': {
                    btn = document.querySelector('[data-confirm]');
                }; break;
            }

            if (btn) {
                btn.focus();
            }
        }, 1000);
    };

    $ctrl.cancel = () => {
        if (typeof ($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.confirm = () => {
        if (typeof ($ctrl.modal.scope.confirm) === 'function') {
            $ctrl.modal.scope.confirm();
        }

        $ctrl.close();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        '$timeout',
        ModalNotificationComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-notification.html',
};