let RecordsComponent = function(
    $state,
    appConfigs,
    ModalService
) {
    let $ctrl = this;

    if (!appConfigs.features || !appConfigs.features.records.list) {
        return $state.go('home');
    }

    $ctrl.appConfigs = appConfigs;

    $ctrl.recordsByTypesKey = {};

    $ctrl.openActivateCodePopup = function () {
        ModalService.open('modalActivateCode', {});
    };

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
        'appConfigs',
        'ModalService',
        RecordsComponent
    ],
    templateUrl: 'assets/tpl/pages/records.html'
};