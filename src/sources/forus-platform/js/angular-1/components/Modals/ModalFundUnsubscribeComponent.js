const ModalFundUnsubscribeComponent = function(
    $state,
    FormBuilderService,
    FundUnsubscribeService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        let organization = $ctrl.modal.scope.organization;
        $ctrl.providerFund = $ctrl.modal.scope.providerFund;
        $ctrl.dateMinLimit = new Date();

        $ctrl.form = FormBuilderService.build({
            unsubscribe_date: null,
            note: "",
        }, (form) => {
            FundUnsubscribeService.store(organization.id, {
                fund_provider_id: $ctrl.providerFund.id,
                ...form.values
            }).then((res) => {
                PushNotificationsService.success('Fund unsubsribe request has been sent');
                $ctrl.close();
                $state.reload();
            }, (res) => {
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
        '$state',
        'FormBuilderService',
        'FundUnsubscribeService',
        'PushNotificationsService',
        ModalFundUnsubscribeComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-unsubscribe.html',
};