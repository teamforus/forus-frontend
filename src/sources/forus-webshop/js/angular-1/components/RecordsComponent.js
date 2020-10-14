let RecordsComponent = function(
    $state,
    appConfigs
) {
    let $ctrl = this;

    if (!appConfigs.features || !appConfigs.features.records.list) {
        return $state.go('home');
    }

    $ctrl.appConfigs = appConfigs;
    $ctrl.recordsByTypesKey = {};
    $ctrl.openActivateCodePopup = () => $state.go('start');

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
        RecordsComponent
    ],
    templateUrl: 'assets/tpl/pages/records.html'
};