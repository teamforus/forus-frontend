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
    VoucherService
) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

    let fetchingFund = false;

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.goToVoucher = (fundId) => {
        $state.go('voucher', {
            address: $ctrl.vouchers.filter((voucher) => {
                return voucher.fund_id == fundId && voucher.type == 'regular';
            })[0].address
        });
    }

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        provider.showOffices = !provider.showOffices;
    };

    $scope.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    $ctrl.isApplicable = false;

    let isValidProductVoucher = (voucher, fundIds) => {
        return (fundIds.indexOf(voucher.fund_id) != -1) && !voucher.parent && !voucher.expired;
    };

    $ctrl.requestFund = (fund) => {
        fetchingFund = true;

        FundService.readById(fund.id).then(res => {
            fetchingFund = false;
            let fund = res.data.data;

            if (fund.taken_by_partner) {
                $ctrl.showPartnerModal();
            } else {
                $state.go('fund-activate', {
                    fund_id: fund.id
                });
            }
        }, () => fetchingFund = false);
    };

    $ctrl.showPartnerModal = () => {
        ModalService.open('modalNotification', {
            type: 'info',
            title: 'Dit tegoed is al geactiveerd',
            closeBtnText: 'Bevestig',
            description: [
                "U krijgt deze melding omdat het tegoed is geactiveerd door een ",
                "famielid of voogd. De tegoeden zijn beschikbaar in het account ",
                "van de persoon die deze als eerste heeft geactiveerd."
            ].join(''),
        });
    };

    $ctrl.$onInit = function() {
        const fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.signedIn = AuthService.hasCredentials();
        $ctrl.subsidyFunds = $ctrl.product.funds.filter(fund => fund.type === 'subsidies');
        $ctrl.useSubsidies = $ctrl.subsidyFunds.length > 0
        $ctrl.useBudget = $ctrl.product.funds.filter(fund => fund.type === 'budget').length > 0
        $ctrl.fundNames = $ctrl.product.funds.map(fund => fund.name).join(', ');
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);

        $ctrl.lowAmountVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) &&
                parseFloat($ctrl.product.price) >= parseFloat(voucher.amount) &&
                voucher.fund.type == 'budget';
        });

        $ctrl.product.funds.forEach(fund => {
            let product_expire_at = moment($ctrl.product.expire_at);
            let fund_expire_at = moment(fund.end_at);

            fund.meta = {};

            fund.meta.applicableSubsidyVouchers = $ctrl.vouchers.filter(voucher => {
                return isValidProductVoucher(voucher, [fund.id]) && voucher.fund.type == 'subsidies';
            });

            fund.meta.applicableBudgetVouchers = $ctrl.vouchers.filter(voucher => {
                return isValidProductVoucher(voucher, [fund.id]) &&
                    parseFloat($ctrl.product.price) <= parseFloat(voucher.amount) &&
                    voucher.fund.type == 'budget';
            });

            fund.meta.isApplicable = fund.meta.applicableBudgetVouchers.length > 0;
            fund.meta.isApplicableSubsidy = fund.meta.applicableSubsidyVouchers.length > 0;
            
            fund.shownExpireDate = !$ctrl.product.expire_at || product_expire_at.isAfter(fund_expire_at) ? 
                fund.end_at_locale : $ctrl.product.expire_at_locale;
        })

        $ctrl.isApplicable = $ctrl.product.funds.filter(
            fund => fund.meta.isApplicable
        ).length > 0;

        $ctrl.applicableBudgetVouchers = $ctrl.product.funds.filter(
            fund => fund.meta.applicableBudgetVouchers
        ).length > 0;

        const implementation = $i18n('implementation_name.' + appConfigs.client_key);
        $rootScope.pageTitle = $i18n('page_state_titles.product', { implementation, product_name: $ctrl.product.name });
    };

    $ctrl.applyProduct = () => {
        if ($ctrl.applicableBudgetVouchers.length == 1) {
            let voucher = $ctrl.applicableBudgetVouchers[0];

            let fund_expire_at = moment(voucher.fund.end_date);
            let product_expire_at = $ctrl.product.expire_at ? moment($ctrl.product.expire_at) : false;

            let expire_at = product_expire_at && fund_expire_at.isBefore(
                product_expire_at
            ) ? voucher.last_active_day_locale : $ctrl.product.expire_at_locale;

            return ModalService.open('modalProductApply', {
                expire_at: expire_at,
                product: $ctrl.product,
                org_name: $ctrl.product.organization.name,
                confirm: () => {
                    return VoucherService.makeProductVoucher(
                        voucher.address,
                        $ctrl.product.id
                    ).then(res => {
                        $state.go('voucher', res.data.data);
                    }, console.error);
                }
            });
        } else {
            return $state.go('products-apply', {
                id: $ctrl.product.id
            });
        }
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
        'VoucherService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};
