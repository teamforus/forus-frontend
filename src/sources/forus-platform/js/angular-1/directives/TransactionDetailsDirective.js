const TransactionDetailsDirective = function (
    $scope,
    appConfigs,
    ModalService,
    TransactionService,
    PushNotificationsService,
    ProductReservationService
) {
    const $dir = $scope.$dir;

    $dir.updateTransaction = () => {
        TransactionService.show(
            appConfigs.panel_type, 
            $dir.organization.id, 
            $dir.transaction.address
        ).then((res) => {
            $dir.transaction = res.data.data;
        });
    }

    $dir.cancelTransaction = (reservation) => {
        ModalService.open("dangerZone", {
            title: "Weet u zeker dat u de betaling wilt annuleren?",
            description_text: "Als u de betaling annuleert wordt de bestelling ongedaan gemaakt. U ontvangt geen betaling en de klant krijgt het tegoed terug.",
            cancelButton: "Sluiten",
            confirmButton: "Bevestigen",
            onConfirm: () => {
                ProductReservationService.reject($dir.organization.id, reservation.id).then(() => {
                    PushNotificationsService.success('Opgeslagen!');
                    $dir.updateTransaction();

                    if (typeof $dir.onUpdate == 'function') {
                        $dir.onUpdate();
                    }
                }, (res) => PushNotificationsService.danger(res.data.message));
            },
        });
    };

    $dir.$onInit = () => {
        $dir.appConfigs = appConfigs;
        $dir.showVoucherDetailsPage = $dir.transaction.voucher && appConfigs.panel_type == 'sponsor';
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            organization: '=',
            transaction: '=',
            showAmount: '=',
            showDetailsPageBtn: '=',
            onUpdate: '&',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'appConfigs',
            'ModalService',
            'TransactionService',
            'PushNotificationsService',
            'ProductReservationService',
            TransactionDetailsDirective
        ],
        templateUrl: 'assets/tpl/directives/transaction-details.html'
    };
};