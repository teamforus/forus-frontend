let ModalFundRequestRecordDeclineComponent = function(
    FundRequestValidatorService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build({
            note: 'test note'
        }, (form) => {
            console.log(form);
            // FundRequestValidatorService.
        }, true);
    };
    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FundRequestValidatorService',
        'FormBuilderService',
        ModalFundRequestRecordDeclineComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-request-decline.html';
    }
};