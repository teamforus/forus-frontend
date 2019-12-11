let RecordValidationsComponent = function() {
    let $ctrl = this;

    $ctrl.recordsByTypesKey = {};

    $ctrl.$onInit = function() {
        $ctrl.recordTypes.forEach((recordType) => {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });
    };
};

module.exports = {
    bindings: {
        record: '<',
        records: '<',
        recordTypes: '<'
    },
    controller: [
        RecordValidationsComponent
    ],
    templateUrl: 'assets/tpl/pages/record-validations.html'
};