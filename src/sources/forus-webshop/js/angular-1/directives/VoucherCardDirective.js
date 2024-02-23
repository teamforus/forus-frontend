let VoucherCardDirective = function(
    $state,
    $scope,
    VoucherService,
    ModalService
) {
    $scope.voucherCard = VoucherService.composeCardData($scope.voucher);

    $scope.voucherCard.disabled =
        ($scope.voucherCard.type == 'product' && $scope.voucher.used) ||
        ($scope.voucherCard.type == 'product' && $scope.voucher.expired && !$scope.voucher.used) ||
        ($scope.voucherCard.type == 'regular' && $scope.voucher.expired && !$scope.voucher.last_transaction_at); // Regular voucher which has no transactions should be disabled; todo: should check with backend flags on to disable transactions on voucher list

    $scope.deleteVoucher = ($event, voucher) => {
        $event.preventDefault();
        $event.stopPropagation();

        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Annuleer reservering',
            mdiIconType: 'warning',
            mdiIconClass: 'alert-outline',
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