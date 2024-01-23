let ModalNotificationComponent = function(
    $filter,
    $element,
    $timeout
) {
    let $ctrl = this;

    $ctrl.showCloseBtn = false;
    $ctrl.showCancelBtn = false;
    $ctrl.showConfirmBtn = false;

    $ctrl.confirmBtnText = $filter('translate')('modal.buttons.confirm');
    $ctrl.closeBtnText = $filter('translate')('modal.buttons.close');
    $ctrl.cancelBtnText = $filter('translate')('modal.buttons.cancel');

    $ctrl.$onInit = () => {
        let type = $ctrl.modal.scope.type;

        $ctrl.modalClass = $ctrl.modal.scope.modalClass || '';

        $ctrl.headerTitle = $ctrl.modal.scope.headerTitle;
        $ctrl.title = $ctrl.modal.scope.title;
        $ctrl.notice = $ctrl.modal.scope.notice;
        $ctrl.email = $ctrl.modal.scope.email
        $ctrl.description = $ctrl.modal.scope.description;
        $ctrl.descriptionIsArray = Array.isArray($ctrl.description);
        $ctrl.subdescription = $ctrl.modal.scope.subdescription;
        $ctrl.icon_filetype = $ctrl.modal.scope.icon_filetype ? $ctrl.modal.scope.icon_filetype : '.png';
        $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon, $ctrl.icon_filetype) : null;
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

    let getIcon = (icon, filetype) => {
        return './assets/img/modal/' + icon + filetype;
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
        '$element',
        '$timeout',
        ModalNotificationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-notification.html';
    }
};