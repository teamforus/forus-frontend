let VoucherCardDirective = function(
    $scope,
    VoucherService,
    ModalService
) {
    $scope.voucherCard = VoucherService.composeCardData($scope.voucher);

    $scope.voucherCard.disabled = ($scope.voucherCard.type == 'product' && $scope.voucher.transactions.length) ||
        ($scope.voucher.expired && !$scope.voucher.transactions.length);

    $scope.deleteVoucher = ($event, voucher) => {
        $event.preventDefault();
        $event.stopPropagation();

        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Annuleer reservering',
            icon: 'voucher_apply',
            description: 'voucher.delete_voucher.popup_form.description',
            confirmBtnText: 'voucher.delete_voucher.buttons.submit',
            cancelBtnText: 'voucher.delete_voucher.buttons.close',
            confirm: () => {
                VoucherService.destroy(
                    voucher.address
                ).then(function(res) {
                    $state.go('vouchers')
                })
            }
        })
    }
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
            'ModalService',
            VoucherCardDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-card.html' 
    };
};