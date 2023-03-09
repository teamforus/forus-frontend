const ReimbursementComponent = function ($state, ReimbursementService) {
    const $ctrl = this;

    $ctrl.cancelReimbursement = ($event) => {
        $event.preventDefault();
        $event.stopPropagation();

        ReimbursementService.confirmDestroy($ctrl.reimbursement).then((success) => {
            if (success) {
                $state.go('reimbursements');
            }
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.previewIndex = 0;
    }
};

module.exports = {
    bindings: {
        reimbursement: '<',
    },
    controller: [
        '$state',
        'ReimbursementService',
        ReimbursementComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursement.html',
};