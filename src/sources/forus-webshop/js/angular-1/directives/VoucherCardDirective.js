let VoucherCardDirective = function(
    $state,
    $scope,
    VoucherService,
    ModalService
) {
    $scope.voucherCard = VoucherService.composeCardData($scope.voucher);

    $scope.voucherCard.disabled =
        ($scope.voucherCard.type == 'product' && $scope.voucher.used) ||
        ($scope.voucher.expired && !$scope.voucher.used);

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
            confirm: () => VoucherService.destroy(voucher.address).then(() => {
                $state.go('vouchers', {}, { reload: true });
            })
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
            '$state',
            '$scope',
            'VoucherService',
            'ModalService',
            VoucherCardDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-card.html'
    };
};