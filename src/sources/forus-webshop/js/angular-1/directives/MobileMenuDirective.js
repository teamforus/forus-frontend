const MobileMenuDirective = function (
    $scope,
    $rootScope,
    $state,
    appConfigs,
    FundService,
    VoucherService,
    ModalService,
) {
    const { $dir } = $scope;

    $dir.appConfigs = appConfigs;

    $dir.hideMobileMenu = () => {
        $rootScope.mobileMenuOpened = false;
    };

    const getFundList = () => {
        FundService.list(null, { check_criteria: 1 }).then((res) => $dir.funds = res.data.data);
    }

    $dir.onAuthUserChange = (auth_user) => {
        if (!auth_user) {
            return $dir.vouchers = null;
        }

        getFundList();
        VoucherService.list().then((res) => $dir.vouchers = res.data.data);
    };

    $dir.startFundRequest = () => {
        $dir.hideMobileMenu();

        if ($dir.funds && $dir.funds.length > 0) {
            $state.go('start');
        }
    };

    $dir.openPinCodePopup = () => {
        ModalService.open('modalPinCode');
    };

    $dir.$onInit = () => {
        getFundList();
        $dir.$state = $state;

        $scope.$on('identity:update', (_, auth_user) => $dir.onAuthUserChange(auth_user));
    };
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        bindToController: true,
        controllerAs: '$dir',
        controller: [
            '$scope',
            '$rootScope',
            '$state',
            'appConfigs',
            'FundService',
            'VoucherService',
            'ModalService',
            MobileMenuDirective,
        ],
        templateUrl: 'assets/tpl/directives/mobile-menu.html',
    };
};