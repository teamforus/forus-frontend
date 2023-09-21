let VoucherRecordsEditorDirective = function(
    $scope,
) {
    const $dir = $scope.$dir;

    $dir.showRecordSelector = false;
    $dir.fund = $scope.fund;
    $dir.voucherRecords = $scope.voucherRecordValues || [];

    $dir.recordsList = $dir.fund.criteria.map((criteria) => {
        return {
            key: criteria.record_type_key,
            name: criteria.record_type_name,
        }
    });
    $dir.record = $dir.recordsList[0].key;

    $dir.addRecord = (record_key) => {
        if ($dir.voucherRecords.find(record => record.key == record_key)) {
            return;
        }

        $dir.voucherRecords.push({
            key: record_key,
            name: $dir.recordsList.find(record => record.key == record_key).name,
        });
    };

    $dir.removeRecord = (record_key) => {
        $dir.voucherRecords = $dir.voucherRecords.filter(record => record.key != record_key);
    }
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            voucherRecordValues: '=',
        },
        restrict: "EA",
        controllerAs: '$dir',
        replace: true,
        controller: [
            '$scope',
            VoucherRecordsEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-records-editor.html'
    };
};