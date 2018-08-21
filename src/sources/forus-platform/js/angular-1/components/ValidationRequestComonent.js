let ValidationRequestComonent = function(
    $state,
    $rootScope,
    ValidatorRequestService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        $ctrl.approve = function(request) {
            ValidatorRequestService.approve(request.id).then(
                () => $state.reload()
            );
        };

        $ctrl.decline = function(request) {
            ValidatorRequestService.decline(request.id).then(
                () => $state.reload()
            );
        };
    };
};

module.exports = {
    bindings: {
        validatorRequest: '<'
    },
    controller: [
        '$state',
        '$rootScope',
        'ValidatorRequestService',
        'appConfigs',
        ValidationRequestComonent
    ],
    templateUrl: 'assets/tpl/pages/validation-request.html'
};