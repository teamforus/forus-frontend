const ModalIdentityProxyExpiredComponent = function($state) {
    const $ctrl = this;

    $ctrl.cancel = () => {
        $ctrl.close();
        $state.go('home');
    }

    $ctrl.openLoginModal = () => {
        $ctrl.close();
        $state.go('start', { redirect_scope: $ctrl.modal.scope });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$state',
        ModalIdentityProxyExpiredComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-identity-proxy-expired.html',
};