let ModalPhysicalCardUnlinkComponent = function(
    PhysicalCardsService,
) {
    let $ctrl = this;
    
    $ctrl.voucher = null;
    $ctrl.state = 'start';

    $ctrl.askConfirmation = () => {
        $ctrl.state = 'confirmation';
    };

    $ctrl.unlink = () => {
        PhysicalCardsService.destroy(
            $ctrl.voucher.address, 
            $ctrl.voucher.physical_card.id
        ).then(() => {
            $ctrl.state = 'unlinked';
        }, console.error);
    };

    $ctrl.requestNewCard = () => {
        $ctrl.onClose(true);
        $ctrl.modal.close();
    }

    $ctrl.closeModal = () => {
        $ctrl.onClose(false);
        $ctrl.modal.close();
    };
    
    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.onClose = $ctrl.modal.scope.onClose;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        voucher: '<',
    },
    controller: [
        'PhysicalCardsService',
        ModalPhysicalCardUnlinkComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-physical-card-unlink.html';
    }
};