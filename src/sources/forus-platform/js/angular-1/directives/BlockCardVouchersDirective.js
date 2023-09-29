const BlockCardVouchersDirective = function (
    $scope,
    VoucherService,
    LocalStorageService,
    PushNotificationsService
) {
    const $dir = $scope.$dir;

    $dir.paginationStorageKey = 'block_vouchers_per_page';

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

        VoucherService.index($dir.organization.id, filters).then((res) => {
            $dir.vouchers = res.data;
        }, (res) => PushNotificationsService.danger('Error!', res.data.message));
    };

    $dir.showTooltip = (e, target) => {
        e?.stopPropagation();
        e?.preventDefault();

        $dir.vouchers.data.forEach((voucher) => voucher.showTooltip = voucher === target);
    };

    $dir.hideTooltip = (e, voucher) => {
        e?.stopPropagation();
        e?.preventDefault();

        voucher.showTooltip = false;
    };

    $dir.onExternalFilterUpdated = () => {
        $dir.filters.initialValues = angular.copy($dir.filterValues);
        $dir.filters.reset();

        $dir.onPageChange($dir.filters.values);
    };

    $dir.onAuthUserUpdated = (authUser) => {
        $dir.authUser = authUser;
    };

    $dir.$onInit = () => {
        if ($dir.register) {
            $dir.register({ directive: $dir });
        }

        $dir.fundClosed = $dir.fund.state === 'closed';

        $scope.$watch('$dir.filterValues', $dir.onExternalFilterUpdated, true);
        $scope.$watch('$root.auth_user', $dir.onAuthUserUpdated);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            watch: '<',
            organization: '=',
            fund: '=',
            filterValues: '=',
            hideFilterForm: '<',
            register: '&',
            blockTitle: '@',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'VoucherService',
            'LocalStorageService',
            'PushNotificationsService',
            BlockCardVouchersDirective
        ],
        templateUrl: 'assets/tpl/directives/block-card-vouchers.html'
    };
};