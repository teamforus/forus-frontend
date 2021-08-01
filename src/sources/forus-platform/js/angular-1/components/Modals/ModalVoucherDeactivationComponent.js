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

        $ctrl.form = FormBuilderService.build({
            note: '',
            notify_by_email: false,
        }, (form) => {
            const { notify_by_email } = form.values;
            const $transKey = 'modals.modal_voucher_deactivation.danger_zone';
            const $transData = { fund_name: voucher.fund.name, email: voucher.identity_email };

            // TODO: 1) texts when there is no email
            // TODO: 3) texts when there is no email but has the bsn
            const descNotification = $translate(`${$transKey}.description_notification`, $transData);
            const descNoNotification = $translate(`${$transKey}.description_no_notification`, $transData);

            $ctrl.modal.loaded = false;

            ModalService.open("dangerZone", {
                title: $translate(`${$transKey}.title`, $transData),
                description_text: notify_by_email ? descNotification : descNoNotification,
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
    $ctrl.$onDestroy = function() { };
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