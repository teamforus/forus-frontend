let VoucherRecordsEditorDirective = function(
    $scope,
    RecordTypeService
) {
    const $dir = $scope.$dir;

    $dir.showRecordSelector = false;
    $dir.showVoucherAddBlock = true;
    $dir.fund = $scope.fund;

    $scope.$watch('voucherRecordValues', (voucherRecords) => {
        $dir.voucherRecords = voucherRecords || [];
    }, true);

    const getVoucherRecordTypes = () => {
        RecordTypeService.list({ vouchers: 1 }).then((res) => {
            $dir.recordOptions = res.data;
            $dir.recordOptionsAll = res.data;
            $dir.record = $dir.recordOptions[0].key;
        });
    };

    $dir.addRecord = (record_key) => {
        if ($dir.voucherRecords.find(record => record.key == record_key)) {
            return;
        }

        $dir.voucherRecords.push({
            key: record_key,
            name: $dir.recordOptions.find(record => record.key == record_key).name,
        });

        $dir.recordOptions = $dir.recordOptions.filter(record => record.key != record_key);
        $dir.showVoucherAddBlock = $dir.recordOptions.length;
        $dir.record = $dir.recordOptions[0].key;
    };

    $dir.removeRecord = (record_key) => {
        $dir.voucherRecords = $dir.voucherRecords.filter(record => record.key != record_key);

        $dir.recordOptions.push($dir.recordOptionsAll.find(record => record.key == record_key));
        $dir.showVoucherAddBlock = $dir.recordOptions.length;
    }

    $dir.$onInit = () => {
        getVoucherRecordTypes();
    };
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
            'RecordTypeService',
            VoucherRecordsEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-records-editor.html'
    };
};