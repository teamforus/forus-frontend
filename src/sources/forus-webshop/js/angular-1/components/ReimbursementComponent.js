const ReimbursementComponent = function ($rootScope, $state, $filter, ReimbursementService) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

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

        $rootScope.pageTitle = $i18n('page_state_titles.reimbursement', {
            code: '#' + $ctrl.reimbursement.code,
        });
    }
};

module.exports = {
    bindings: {
        reimbursement: '<',
    },
    controller: [
        '$rootScope',
        '$state',
        '$filter',
        'ReimbursementService',
        ReimbursementComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursement.html',
};