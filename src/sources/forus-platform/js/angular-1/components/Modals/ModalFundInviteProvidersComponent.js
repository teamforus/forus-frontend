let ModalFundInviteProvidersComponent = function(
    $timeout,
    FundService,
    FormBuilderService,
    PageLoadingBarService,
    FundProviderInvitationsService
) {
    let $ctrl = this;

    PageLoadingBarService.setProgress(0);

    $ctrl.bindEvents = () => {
        $('body :focus').each((index, el) => el.blur())
        $('body').bind('keydown.close_modal', (e) => {
            $timeout(function() {
                var key = e.charCode || e.keyCode || 0;

                // Esc
                if (key == 27) {
                    $ctrl.closeAnimated();
                }

                // Enter
                if (key == 13 && $ctrl.form && typeof $ctrl.form.submit == 'function') {
                    $ctrl.form.submit();
                }
            }, 0);
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.bindEvents();

        $ctrl.fund = $ctrl.modal.scope.fund;

        FundService.list($ctrl.fund.organization_id).then(res => {
            $ctrl.loaded = true;
            PageLoadingBarService.setProgress(100);

            $ctrl.funds = res.data.data.filter(fund => fund.id != $ctrl.fund.id);
            $ctrl.form = FormBuilderService.build({
                fund_id: $ctrl.funds[0].id
            }, (form) => {
                PageLoadingBarService.setProgress(0);

                FundProviderInvitationsService.store(
                    $ctrl.fund.organization_id,
                    $ctrl.fund.id,
                    form.values.fund_id
                ).then(res => {
                    PageLoadingBarService.setProgress(100);
                    $ctrl.modal.scope.confirm(res.data.data);
                    $ctrl.closeAnimated();
                }, res => {
                    PageLoadingBarService.setProgress(100);
                    form.errors = res.data.errors;
                    form.unlock();
                });
            });
        });
    };

    $ctrl.$onDestroy = () => {
        $('body').unbind('keydown.close_modal');
    };

    $ctrl.closeAnimated = () => {
        $ctrl.loaded = false;
        $timeout(() => $ctrl.close(), 250);

    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        'FundService',
        'FormBuilderService',
        'PageLoadingBarService',
        'FundProviderInvitationsService',
        ModalFundInviteProvidersComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-invite-providers.html';
    }
};