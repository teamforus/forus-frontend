const ModalFundRequestAssignValidatorComponent = function(
    FormBuilderService,
    PageLoadingBarService,
    FundRequestValidatorService
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { confirm, employees, organization, fundRequest } = $ctrl.modal.scope;

        $ctrl.confirm = confirm;
        $ctrl.employees = employees;

        $ctrl.form = FormBuilderService.build({
            employee_id: $ctrl.employees[0]?.id
        }, (form) => {
            PageLoadingBarService.setProgress(0);

            FundRequestValidatorService.assignBySupervisor(
                organization.id,
                fundRequest.id,
                form.values
            ).then((res) => {
                $ctrl.confirm(res.data.data);
                $ctrl.close();
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            }).finally(() => PageLoadingBarService.setProgress(100));
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
        'PageLoadingBarService',
        'FundRequestValidatorService',
        ModalFundRequestAssignValidatorComponent
    ],
    templateUrl: 'assets/tpl/modals/modal-fund-request-assign-validator.html',
};