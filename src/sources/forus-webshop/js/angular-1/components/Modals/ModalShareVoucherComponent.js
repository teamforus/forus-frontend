const ModalShareVoucherComponent = function(
    VoucherService,
    FormBuilderService,
    ModalService
) {
    const $ctrl = this;

    $ctrl.toggleSendCopy = ($event, current_value = false) => {
        if ($event?.key == 'Enter') {
            $ctrl.shareVoucherForm.values.send_copy = !current_value;
        }
    };

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
                    title: 'Delen',
                    header: 'voucher.share_voucher.popup_sent.title',
                    mdiIconType: "success",
                    mdiIconClass: 'check-circle-outline',
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