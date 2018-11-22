let ModalNotificationComponent = function() {
    let $ctrl = this;

    $ctrl.showCloseBtn = false;
    $ctrl.showCancelBtn = false;
    $ctrl.showConfirmBtn = false;

    $ctrl.$onInit = () => {
        let type = $ctrl.modal.scope.type;
        $ctrl.class = 'modal-notification-' + type;

        switch (type){
            case 'info': {
                $ctrl.title = $ctrl.modal.scope.title;
                $ctrl.description = $ctrl.modal.scope.description ? $ctrl.modal.scope.description : null;
                $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon) : null;
                $ctrl.showCloseBtn = true;
            }; break;
            case 'danger': {
                $ctrl.title = $ctrl.modal.scope.title;
                $ctrl.description = $ctrl.modal.scope.description ? $ctrl.modal.scope.description : null;
                $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon) : null;
                $ctrl.showCancelBtn = true;
            }; break;
            case 'confirm': {
                $ctrl.title = $ctrl.modal.scope.title;
                $ctrl.description = $ctrl.modal.scope.description ? $ctrl.modal.scope.description : null;
                $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon) : null;
                $ctrl.showCancelBtn = true;
                $ctrl.showConfirmBtn = true;
            }; break;
            default:{
                $ctrl.title = $ctrl.modal.scope.title;
                $ctrl.description = $ctrl.modal.scope.description ? $ctrl.modal.scope.description : null;
                $ctrl.icon = $ctrl.modal.scope.icon ? getIcon($ctrl.modal.scope.icon) : null;
                $ctrl.showCloseBtn = true;
            }
        }
    };

    let getIcon = (icon) => {

        switch (icon){
            case 'product_error_create_more': {
                return './assets/img/modal/product-error.png';
            }; break;
            case 'product_create': {
                return './assets/img/modal/product-create.png';
            }; break;
            case 'fund_applied': {
                return './assets/img/modal/fund_applied.png';
            }; break;
            default:{
                return './assets/img/modal/product-error.png';
            }
        }
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
        ModalNotificationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-notification.html';
    }
};