const ValidationRequestComponent = function(
    $state,
    ValidatorRequestService,
    appConfigs
) {
    if (!appConfigs.features.organizations.funds.fund_requests) {
        return $state.go('csv-validation');
    }

    const $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.approve = function(request) {
            ValidatorRequestService.approve(request.id).then(() => $state.reload());
        };

        $ctrl.decline = function(request) {
            ValidatorRequestService.decline(request.id).then(() => $state.reload());
        };
    };
};

module.exports = {
    bindings: {
        validatorRequest: '<'
    },
    controller: [
        '$state',
        'ValidatorRequestService',
        'appConfigs',
        ValidationRequestComponent
    ],
    templateUrl: 'assets/tpl/pages/validation-request.html'
};