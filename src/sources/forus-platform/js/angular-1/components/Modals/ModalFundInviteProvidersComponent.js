const ModalFundInviteProvidersComponent = function(
    FundService,
    FormBuilderService,
    PageLoadingBarService,
    FundProviderInvitationsService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund;

        FundService.list($ctrl.fund.organization_id, { with_archived: 1 }).then((res) => {
            $ctrl.modal.setLoaded();

            $ctrl.funds = res.data.data.filter(fund => fund.id != $ctrl.fund.id);
            $ctrl.form = FormBuilderService.build({
                fund_id: $ctrl.funds[0]?.id
            }, (form) => {
                PageLoadingBarService.setProgress(0);

                FundProviderInvitationsService.store(
                    $ctrl.fund.organization_id,
                    $ctrl.fund.id,
                    form.values.fund_id
                ).then(res => {
                    $ctrl.modal.scope.confirm(res.data.data);
                    $ctrl.close();
                }, res => {
                    form.errors = res.data.errors;
                    form.unlock();
                }).finally(() => PageLoadingBarService.setProgress(100));
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
        'FundService',
        'FormBuilderService',
        'PageLoadingBarService',
        'FundProviderInvitationsService',
        ModalFundInviteProvidersComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-invite-providers.html',
};