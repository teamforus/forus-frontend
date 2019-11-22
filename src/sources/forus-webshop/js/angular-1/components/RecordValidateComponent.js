let RecordValidateComponent = function(
    $state,
    ValidatorRequestService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.validators = $ctrl.validators.map(function(validator) {
            validator.isPending = $ctrl.validationRequests.filter(request => {
                return (request.validator_id == validator.id) && (
                    request.state == 'pending'
                ) && (request.record_id == $ctrl.record.id);
            }).length > 0;

            return validator;
        });
    };

    $ctrl.requestValidation = (validator) => {
        ValidatorRequestService.requestValidation(
            validator.id,
            $ctrl.record.id
        ).then(res => {
            $state.reload();
        }, console.error);
    };
};

module.exports = {
    bindings: {
        record: '<',
        records: '<',
        validators: '<',
        validationRequests: '<',
        recordTypes: '<'
    },
    controller: [
        '$state',
        'ValidatorRequestService',
        RecordValidateComponent
    ],
    templateUrl: 'assets/tpl/pages/record-validate.html'
};