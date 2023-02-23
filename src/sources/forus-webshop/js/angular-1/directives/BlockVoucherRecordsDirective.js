const BlockVoucherRecordsDirective = function(
    $scope, 
    VoucherService,
) {
    const { $dir } = $scope;

    $dir.$onInit = () => {
        $dir.voucher = VoucherService.composeCardData($dir.voucher);
    };
};

module.exports = () => {
    return {
        scope: {
            toggle: '=',
            compact: '=',
            voucher: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'VoucherService',
            BlockVoucherRecordsDirective,
        ],
        templateUrl: 'assets/tpl/directives/block-voucher-records.html',
    };
};
