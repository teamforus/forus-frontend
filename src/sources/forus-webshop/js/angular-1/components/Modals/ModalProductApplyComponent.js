let ModalProductApplyComponent = function() {
    let $ctrl = this;

    $ctrl.$onInit = () => {};

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
        ModalProductApplyComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-apply.html';
    }
};