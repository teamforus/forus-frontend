let RecordsComponent = function(
    $state,
    $rootScope,
    $timeout,
    CredentialsService,
    IdentityService,
    AuthService,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.recordsByTypesKey = {};

    $ctrl.$onInit = function() {

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });
    };
};

module.exports = {
    bindings: {
        records: '<',
        recordTypes: '<',
    },
    controller: [
        '$state',
        '$rootScope',
        '$timeout',
        'CredentialsService',
        'IdentityService',
        'AuthService',
        'appConfigs',
        RecordsComponent
    ],
    templateUrl: 'assets/tpl/pages/records.html'
};