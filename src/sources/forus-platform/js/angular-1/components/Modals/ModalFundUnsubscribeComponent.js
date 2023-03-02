const ModalFundUnsubscribeComponent = function(
    FormBuilderService,
    FundUnsubscribeService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.onUnsubscribe = $ctrl.modal.scope.onUnsubscribe;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.providerFund = $ctrl.modal.scope.providerFund;
        $ctrl.dateMinLimit = new Date();

        $ctrl.form = FormBuilderService.build({
            unsubscribe_date: null,
            note: "",
        }, (form) => {
            FundUnsubscribeService.store($ctrl.organization.id, {
                fund_provider_id: $ctrl.providerFund.id,
                ...form.values
            }).then(() => {
                PushNotificationsService.success('Gelukt!', 'Verzoek afmelding verstuurd.');
                $ctrl.close();
                $ctrl.onUnsubscribe();
            }, (res) => {
                PushNotificationsService.danger('Er is iets mis gegaan.', 'Probeer het probleem op te lossen en opnieuw te versturen.');
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'FundUnsubscribeService',
        'PushNotificationsService',
        ModalFundUnsubscribeComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-unsubscribe.html',
};