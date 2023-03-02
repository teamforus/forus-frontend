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
                PushNotificationsService.success('Success!', 'Fund unsubscribe request has been sent');
                $ctrl.close();
                $ctrl.onUnsubscribe();
            }, (res) => {
                PushNotificationsService.danger('Error!', 'Please fix the errors and try again.');
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