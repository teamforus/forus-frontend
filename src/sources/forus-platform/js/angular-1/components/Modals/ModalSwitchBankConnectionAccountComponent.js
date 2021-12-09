const ModalSwitchBankConnectionAccountComponent = function(
    FormBuilderService,
    BankConnectionService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.bankConnection = $ctrl.modal.scope.bankConnection;

        $ctrl.form = FormBuilderService.build({
            bank_connection_account_id: $ctrl.bankConnection?.account_default?.id,
        }, (form) => {
            const { id, organization_id } = $ctrl.bankConnection;

            BankConnectionService.update(organization_id, id, form.values).then(() => {
                $ctrl.close();
                PushNotificationsService.success('Succes!', 'Het actieve bankaccount is gewijzigd!');
            }, (res) => form.errors = res.data.errors).finally(() => form.unlock());
        }, true);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'BankConnectionService',
        'PushNotificationsService',
        ModalSwitchBankConnectionAccountComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-switch-bank-connection-account.html',
};
