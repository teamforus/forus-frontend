let ModalNotificationComponent = function(
    $filter
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

        $ctrl.title = $ctrl.modal.scope.title;
        $ctrl.notice = $ctrl.modal.scope.notice;
        $ctrl.description = $ctrl.modal.scope.description;
        $ctrl.descriptionIsArray = Array.isArray($ctrl.description);
        $ctrl.subdescription = $ctrl.modal.scope.subdescription;

        $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon) : null;

        $ctrl.confirmBtnText = $ctrl.modal.scope.confirmBtnText ? $ctrl.modal.scope.confirmBtnText : $ctrl.confirmBtnText;
        $ctrl.closeBtnText = $ctrl.modal.scope.closeBtnText ? $ctrl.modal.scope.closeBtnText : $ctrl.closeBtnText;
        $ctrl.cancelBtnText = $ctrl.modal.scope.cancelBtnText ? $ctrl.modal.scope.cancelBtnText : $ctrl.cancelBtnText;

        switch (type){
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
            default:{
                $ctrl.showCloseBtn = true;
            }
        }
    };

    let getIcon = (icon) => {
        return './assets/img/modal/' + icon + '.png';
    };

    $ctrl.cancel = () => {
        if (typeof($ctrl.modal.scope.cancel) === 'function') {
            $ctrl.modal.scope.cancel();
        }

        $ctrl.close();
    };

    $ctrl.confirm = () => {
        if (typeof($ctrl.modal.scope.confirm) === 'function') {
            $ctrl.modal.scope.confirm();
        }

        $ctrl.close();
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        ModalNotificationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-notification.html';
    }
};