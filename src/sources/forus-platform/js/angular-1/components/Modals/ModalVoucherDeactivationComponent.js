const ModalVoucherDeactivationComponent = function(
    $filter,
    $timeout,
    ModalService,
    FormBuilderService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const $translate = $filter('translate');
        const { onSubmit, voucher } = $ctrl.modal.scope;

        $ctrl.voucher = voucher;
        $ctrl.hasEmail = voucher.identity_email;

        $ctrl.form = FormBuilderService.build({
            note: '',
            notify_by_email: false,
        }, (form) => {
            const { notify_by_email } = form.values;

            const $transKey = 'modals.modal_voucher_deactivation.danger_zone';
            const $transData = { fund_name: voucher.fund.name, email: voucher.identity_email };

            const descNoEmail = $translate(`${$transKey}.description_no_email`, $transData);
            const descNotification = $translate(`${$transKey}.description_notification`, $transData);
            const descNotificationEmail = $translate(`${$transKey}.description_notification_email`, $transData);

            const description = $ctrl.hasEmail ? (
                notify_by_email ? descNotification + descNotificationEmail : descNotification
            ) : descNoEmail;

            $ctrl.modal.loaded = false;

            ModalService.open("dangerZone", {
                title: $translate(`${$transKey}.title`, $transData),
                description_text: description,
                text_align: 'left',
                cancelButton: "Annuleren",
                confirmButton: "Bevestigen",
                onCancel: () => $timeout(() => $ctrl.modal.loaded = true, 500),
                onConfirm: () => {
                    $ctrl.close();
                    onSubmit(form.values);
                },
            });
        }, false);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$filter',
        '$timeout',
        'ModalService',
        'FormBuilderService',
        ModalVoucherDeactivationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-deactivation.html';
    }
};