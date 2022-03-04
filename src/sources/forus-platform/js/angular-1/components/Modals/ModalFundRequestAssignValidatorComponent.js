const ModalFundRequestAssignValidatorComponent = function(
    $timeout,
    FormBuilderService,
    PageLoadingBarService,
    FundRequestValidatorService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.employees = $ctrl.modal.scope.employees;

        $ctrl.form = FormBuilderService.build({
            employee: $ctrl.employees[0].identity_address
        }, (form) => {
            PageLoadingBarService.setProgress(0);

            FundRequestValidatorService.assignBySupervisor(
                $ctrl.modal.scope.organization.id,
                $ctrl.modal.scope.fundRequest.id,
                form.values
            ).then(res => {
                PageLoadingBarService.setProgress(100);
                $ctrl.modal.scope.confirm(res.data.data);
                $ctrl.close();
            }, res => {
                PageLoadingBarService.setProgress(100);
                form.errors = res.data.errors;
                form.unlock();
            });
        });
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
        'FormBuilderService',
        'PageLoadingBarService',
        'FundRequestValidatorService',
        ModalFundRequestAssignValidatorComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-request-assign-validator.html';
    }
};