const ModalDeactivateVoucherComponent = function(VoucherService, FormBuilderService) {
    const $ctrl = this;

    const reasons = [
        { key: "moved", value: "Verhuizing" },
        { key: "income_change", value: "Verandering in inkomen" },
        { key: "not_interested", value: "Aanbod is niet aantrekkelijk" },
        { key: "other", value: "Anders" },
    ];

    const showSuccess = () => $ctrl.state = 'success';
    const showReasonForm = () => $ctrl.state = 'reason';
    const showConfirmation = () => $ctrl.state = 'confirmation';

    const buildTheForm = () => {
        return FormBuilderService.build({}, (form) => {
            const note = $ctrl.reason === 'other' ? form.note : $ctrl.reason;

            VoucherService.deactivate($ctrl.voucher.address, { note }).then((res) => {
                $ctrl.deactivatedVoucher = res.data.data;
                $ctrl.showSuccess();
            }, (res) => {
                form.errors = res.data.errors;
                $ctrl.showReasonForm();
            }).finally(() => form.locked = false);
        }, true);
    };

    $ctrl.closeModal = () => {
        if ($ctrl.deactivatedVoucher && (typeof $ctrl.onDeactivated == 'function')) {
            $ctrl.onDeactivated($ctrl.deactivatedVoucher);
        }

        $ctrl.close();
    };

    $ctrl.$onInit = () => {
        const { voucher, onDeactivated } = $ctrl.modal.scope;

        $ctrl.reason = null;
        $ctrl.reasons = reasons;

        $ctrl.voucher = voucher;
        $ctrl.onDeactivated = onDeactivated;
        $ctrl.deactivatedVoucher = false;

        $ctrl.form = buildTheForm();
        $ctrl.showSuccess = showSuccess;
        $ctrl.showReasonForm = showReasonForm;
        $ctrl.showConfirmation = showConfirmation;

        $ctrl.showReasonForm();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        voucher: '<',
    },
    controller: [
        'VoucherService',
        'FormBuilderService',
        ModalDeactivateVoucherComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-deactivate-voucher.html';
    }
};