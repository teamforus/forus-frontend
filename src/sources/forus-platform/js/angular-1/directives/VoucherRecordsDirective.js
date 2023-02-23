const VoucherRecords = function (
    $scope,
    $filter,
    ModalService,
    VoucherRecordService,
    PushNotificationsService,
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_voucher_record.${key}`);

    $dir.filters = {
        q: '',
        order_by: 'created_at',
        order_dir: 'asc',
    };

    $dir.fetchRecords = (filters = {}) => {
        return VoucherRecordService.index($dir.organization.id, $dir.voucher.id, filters).then((res) => res.data);
    }

    $dir.onPageChange = (filters = {}) => {
        $dir.fetchRecords(filters).then((records) => $dir.records = records);
    }

    $dir.editRecord = (record = null) => {
        ModalService.open('voucherRecordEditComponent', {
            organization: $dir.organization,
            voucher: $dir.voucher,
            record: record,
            onClose: (record) => record ? $dir.onPageChange($dir.filters) : null,
        });
    }

    $dir.deleteRecord = (record) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            text_align: 'center',
            onConfirm: () => {
                VoucherRecordService.destroy($dir.organization.id, $dir.voucher.id, record.id).then(() => {
                    $dir.onPageChange($dir.filters);
                    PushNotificationsService.success('Deleted!', 'The voucher record have been deleted.');
                });
            }
        });
    }

    $dir.$onInit = () => {
        $dir.onPageChange($dir.filters);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            voucher: '=',
            organization: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'ModalService',
            'VoucherRecordService',
            'PushNotificationsService',
            VoucherRecords,
        ],
        templateUrl: 'assets/tpl/directives/voucher-records.html',
    };
};