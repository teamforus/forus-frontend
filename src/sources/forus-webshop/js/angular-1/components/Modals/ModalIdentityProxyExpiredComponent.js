let ModalIdentityProxyExpiredComponent = function(
    ModalService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {};

    $ctrl.openLoginModal = () => {
        $ctrl.close();
        
        ModalService.open('modalAuth', {});
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'ModalService',
        ModalIdentityProxyExpiredComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-identity-proxy-expired.html';
    }
};