const ModalShareVoucherComponent = function(
    VoucherService,
    FormBuilderService,
    ModalService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const voucher = $ctrl.modal.scope.voucher;
        const reason = '';

        $ctrl.shareVoucherForm = FormBuilderService.build({ reason }, (form) => {
            form.lock();

            VoucherService.shareVoucher(voucher.address, form.values).then(() => {
                $ctrl.close();

                ModalService.open('modalNotification', {
                    type: 'action-result',
                    class: 'modal-description-pad',
                    title: 'voucher.share_voucher.popup_sent.title',
                    description: 'voucher.share_voucher.popup_sent.description',
                    confirmBtnText: 'voucher.share_voucher.buttons.confirm',
                });
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'VoucherService',
        'FormBuilderService',
        'ModalService',
        ModalShareVoucherComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-share-voucher.html';
    }
};