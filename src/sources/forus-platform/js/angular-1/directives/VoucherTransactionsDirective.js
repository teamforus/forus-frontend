const VoucherTransactionsDirective = function (
    $scope,
    appConfigs,
    TransactionService,
    LocalStorageService,
    PushNotificationsService
) {
    const $dir = $scope.$dir;

    $dir.paginationStorageKey = 'voucher_transactions_per_page';

    $dir.filters = {
        values: {
            per_page: LocalStorageService.getCollectionItem('pagination', $dir.paginationStorageKey, 15),
        },
        visible: false,
        initialValues: {},
        hide: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = false;
        },
        show: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = true;
        },
        reset: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.values = angular.copy($dir.filters.initialValues);
        },
    };

    $dir.onPageChange = (query = {}) => {
        const filters = { ...$dir.filters.values, ...query };

        TransactionService.list(appConfigs.panel_type, $dir.organization.id, filters).then((res) => {
            const data = res.data.data.map((transaction) => {
                const ui_sref = ({
                    address: transaction.address,
                    organization_id: $dir.organization.id,
                });

                return { ...transaction, ui_sref };
            });

            $dir.transactions = { ...res.data, data };
        }, (res) => PushNotificationsService.danger('Error!', res.data.message));
    };

    $dir.onExternalFilterUpdated = () => {
        $dir.filters.initialValues = angular.copy($dir.filterValues);
        $dir.filters.reset();

        $dir.onPageChange($dir.filters.values);
    };

    $dir.$onInit = () => {
        $dir.isSponsor = appConfigs.panel_type == 'sponsor';
        if ($dir.register) {
            $dir.register({ directive: $dir });
        }

        $scope.$watch('$dir.filterValues', $dir.onExternalFilterUpdated, true);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            watch: '<',
            organization: '=',
            filterValues: '=',
            register: '&',
            blockTitle: '@',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'appConfigs',
            'TransactionService',
            'LocalStorageService',
            'PushNotificationsService',
            VoucherTransactionsDirective
        ],
        templateUrl: 'assets/tpl/directives/voucher-transactions.html'
    };
};