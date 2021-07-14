const ProductComponent = function(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $sce,
    $filter,
    appConfigs,
    AuthService,
    FundService,
    ModalService,
    ProductService
) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

    $ctrl.fetchingFund = false;
    $ctrl.isApplicable = false;

    $ctrl.goToVoucher = (fund) => {
        fund.meta.applicableVouchers[0] && $state.go('voucher', fund.meta.applicableVouchers[0]);
    }

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        provider.showOffices = !provider.showOffices;
    };

    $scope.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    $ctrl.requestFund = (fund) => {
        $ctrl.fetchingFund = true;

        FundService.readById(fund.id).then(res => {
            const fund = res.data.data;
            const fund_id = fund.id;

            if (fund.taken_by_partner) {
                return FundService.showTakenByPartnerModal();
            }

            $state.go('fund-activate', { fund_id });
        }).finally(() => $ctrl.fetchingFund = false);
    };

    $ctrl.reserveProduct = (fund) => {
        ModalService.open('modalProductReserve', {
            product: $ctrl.product,
            vouchers: fund.meta.reservableVouchers,
        });
    };

    $ctrl.$onInit = function() {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.signedIn = AuthService.hasCredentials();

        $ctrl.fundNames = $ctrl.product.funds.map(fund => fund.name).join(', ');
        $ctrl.productMeta = ProductService.checkEligibility($ctrl.product, $ctrl.vouchers);
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);

        $ctrl.useSubsidies = $ctrl.productMeta.funds.filter(fund => fund.type === 'subsidies').length > 0;
        $ctrl.useBudget = $ctrl.productMeta.funds.filter(fund => fund.type === 'budget').length > 0;

        const implementation = $i18n('implementation_name.' + appConfigs.client_key);
        $rootScope.pageTitle = $i18n('page_state_titles.product', { implementation, product_name: $ctrl.product.name });
    };
};

module.exports = {
    scope: {
        text: '=',
        button: '=',
    },
    bindings: {
        product: '<',
        vouchers: '<',
    },
    controller: [
        '$scope',
        '$rootScope',
        '$state',
        '$stateParams',
        '$sce',
        '$filter',
        'appConfigs',
        'AuthService',
        'FundService',
        'ModalService',
        'ProductService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};
