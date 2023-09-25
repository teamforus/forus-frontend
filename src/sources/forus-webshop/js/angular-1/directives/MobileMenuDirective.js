const pick = require('lodash/pick');

const MobileMenuDirective = function (
    $scope,
    $rootScope,
    $state,
    appConfigs,
    FundService,
    MenuService,
    ModalService,
    VoucherService,
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

    $dir.signOut = () => {
        $rootScope.signOut()
        $dir.hideMobileMenu();
    };

    $dir.openPinCodePopup = () => {
        ModalService.open('modalPinCode');
    };

    $dir.$onInit = () => {
        getFundList();
        $dir.$state = $state;

        $scope.$on('identity:update', (_, auth_user) => $dir.onAuthUserChange(auth_user));

        $rootScope.$watch(
            (scope) => pick(scope, ['auth_user', 'appConfigs']),
            (value) => $dir.menuItems = MenuService.makeMenuItems(value.appConfigs, value.auth_user),
            true
        );
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
            'MenuService',
            'ModalService',
            'VoucherService',
            MobileMenuDirective,
        ],
        templateUrl: 'assets/tpl/directives/mobile-menu.html',
    };
};