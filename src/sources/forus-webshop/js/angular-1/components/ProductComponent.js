const ProductComponent = function (
    $q,
    $rootScope,
    $state,
    $stateParams,
    $sce,
    $filter,
    appConfigs,
    AuthService,
    FundService,
    ModalService,
    ConfigService,
    ProductService,
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
            meta: fund.meta,
        });
    };

    const transformProductAlternativeText = (product) => {
        return ProductService.transformProductAlternativeText(product);
    };

    $ctrl.toggleBookmark = ($event, product) => {
        $event.preventDefault();
        $event.stopPropagation();

        ProductService.toggleBookmark(product);
    };

    $ctrl.transformFund = (fund) => {
        return $q((resolve, reject) => {
            FundService.readById(fund.id).then(res => {
                resolve(FundService.mapFund(res.data.data, $ctrl.vouchers, appConfigs.features));
            }, reject);
        });
    }

    $ctrl.$onInit = function () {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.onlyAvailableFunds = appConfigs.flags.productDetailsOnlyAvailableFunds;

        $ctrl.fundNames = $ctrl.product.funds.map(fund => fund.name).join(', ');
        $ctrl.productMeta = ProductService.checkEligibility($ctrl.product, $ctrl.vouchers);
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);
        $ctrl.product.alternative_text = transformProductAlternativeText($ctrl.product);

        $ctrl.useSubsidies = $ctrl.productMeta.funds.filter(fund => fund.type === 'subsidies').length > 0;
        $ctrl.useBudget = $ctrl.productMeta.funds.filter(fund => fund.type === 'budget').length > 0;

        ConfigService.get('webshop').then((res) => {
            appConfigs.features = res.data;

            let funds = $ctrl.productMeta.funds;
            funds.forEach((fund, index) => {
                $ctrl.transformFund(fund).then(fundData => {
                    funds[index] = fundData;
                });
            });
        });

        $rootScope.pageTitle = $i18n('page_state_titles.product', {
            product_name: $ctrl.product.name,
            implementation: $i18n(`implementation_name.${appConfigs.client_key}`),
            organization_name: $ctrl.product.organization.name,
        });
    };
};

module.exports = {
    scope: {
        text: '=',
        button: '=',
    },
    bindings: {
        product: '<',
        provider: '<',
        vouchers: '<',
    },
    controller: [
        '$q',
        '$rootScope',
        '$state',
        '$stateParams',
        '$sce',
        '$filter',
        'appConfigs',
        'AuthService',
        'FundService',
        'ModalService',
        'ConfigService',
        'ProductService',
        ProductComponent,
    ],
    templateUrl: 'assets/tpl/pages/product.html',
};
