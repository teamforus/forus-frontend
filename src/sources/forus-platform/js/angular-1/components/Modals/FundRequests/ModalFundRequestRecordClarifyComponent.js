let ModalFundRequestRecordClarifyComponent = function(
    FormBuilderService,
    FundRequestValidatorService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let fund = $ctrl.modal.scope.fund;
        let requestRecord = $ctrl.modal.scope.requestRecord;

        $ctrl.form = FormBuilderService.build({
            note: 'test note'
        }, (form) => {
            /* console.log([
                fund.organization_id,
                fund.id,
                requestRecord.fund_request_id,
                requestRecord.id,
                form.values.note
            ]); */

            FundRequestValidatorService.requestRecordClarification(
                fund.organization_id,
                fund.id,
                requestRecord.fund_request_id,
                requestRecord.id,
                form.values.note
            ).then(console.log, console.error);
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
        'FormBuilderService',
        'FundRequestValidatorService',
        ModalFundRequestRecordClarifyComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-request-clarify.html';
    }
};