const MobileFooterDirective = function(
    $scope,
    $state,
    VoucherService,
    FundService,
) {
    const { $dir } = $scope;

    $dir.visible = true;
    $dir.vouchers = null;
    $dir.funds = null;
    $dir.prevOffsetY = window.pageYOffset;
    $dir.profileMenuOpened = false;

    $dir.hideProfileMenu = () => {
        $dir.profileMenuOpened = false;
    }

    $dir.openProfileMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }

        $dir.profileMenuOpened = !$dir.profileMenuOpened;
    }

    $dir.startFundRequest = () => {
        $dir.hideProfileMenu();

        if ($dir.funds && $dir.funds.length > 0) {
            $state.go('start');
        }
    };

    $dir.updateScrolled = () => {
        const currentOffsetY = window.pageYOffset;

        $dir.visible = ($dir.prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        $dir.prevOffsetY = currentOffsetY;
        $dir.profileMenuOpened = false;
    };

    const getFundList = () => {
        FundService.list(null, {check_criteria: 1}).then((res) => $dir.funds = res.data.data);
    }

    $dir.onAuthUserChange = (auth_user) => {
        if (!auth_user) {
            return $dir.vouchers = null;
        }

        getFundList();
        VoucherService.list().then((res) => $dir.vouchers = res.data.data);
    };

    $dir.$onInit = () => {
        getFundList();
        $dir.$state = $state;

        window.addEventListener('scroll', $dir.updateScrolled);
        $scope.$on('identity:update', (e, auth_user) => $dir.onAuthUserChange(auth_user));
    };

    $dir.$onDestroy = () => {
        window.removeEventListener('scroll', $dir.updateScrolled);
    };
};

module.exports = () => {
    return {
        restrict: "EA",
        replace: true,
        bindToController: true,
        controllerAs: '$dir',
        controller: [
            '$scope',
            '$state',
            'VoucherService',
            'FundService',
            MobileFooterDirective
        ],
        templateUrl: 'assets/tpl/directives/mobile-footer.html'
    };
};
