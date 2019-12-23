let VoucherCardDirective = function(
    $scope,
    VoucherService,
) {
    $scope.voucherCard = VoucherService.composeCardData($scope.voucher);

    $scope.voucherCard.disabled = ($scope.voucherCard.type == 'product' && $scope.voucher.transactions.length) ||
        ($scope.voucher.expired && !$scope.voucher.transactions.length);
};

module.exports = () => {
    return {
        scope: {
            voucher: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'VoucherService',
            VoucherCardDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-card.html' 
    };
};