let ProductComponent = function(
    $scope,
    $state,
    $sce,
    appConfigs,
    FundService,
    ModalService,
    VoucherService
) {
    let $ctrl = this;
    let fetchingFund = false;

    if (!appConfigs.features.products.show) {
        return $state.go('home');
    }

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
                $state.go('fund-request', {
                    fund_id: fund.id
                });
            }
        }, () => {
            fetchingFund = false;
        });
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
        let fundIds = $ctrl.product.funds.map(fund => fund.id);

        $ctrl.subsidyFunds = $ctrl.product.funds.filter(fund => fund.type === 'subsidies');
        $ctrl.useSubsidies = $ctrl.subsidyFunds.length > 0
        $ctrl.useBudget = $ctrl.product.funds.filter(fund => fund.type === 'budget').length > 0

        $ctrl.applicableSubsidyVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) && voucher.fund.type == 'subsidies';
        });

        $ctrl.applicableBudgetVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) &&
                parseFloat($ctrl.product.price) <= parseFloat(voucher.amount) &&
                voucher.fund.type == 'budget';
        });

        $ctrl.lowAmountVouchers = $ctrl.vouchers.filter(voucher => {
            return isValidProductVoucher(voucher, fundIds) &&
                parseFloat($ctrl.product.price) >= parseFloat(voucher.amount) &&
                voucher.fund.type == 'budget';
        });


        $ctrl.fundNames = $ctrl.product.funds.map(fund => fund.name).join(', ');
        $ctrl.isApplicable = $ctrl.applicableBudgetVouchers.length > 0;
        $ctrl.isApplicableSubsidy = $ctrl.applicableSubsidyVouchers.length > 0;
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);
    };

    $ctrl.applyProduct = () => {
        if ($ctrl.applicableBudgetVouchers.length == 1) {
            let voucher = $ctrl.applicableBudgetVouchers[0];

            let fund_expire_at = moment(voucher.fund.end_date);
            let product_expire_at = moment($ctrl.product.expire_at);

            let expire_at = fund_expire_at.isAfter(product_expire_at) ? $ctrl.product.expire_at_locale : voucher.last_active_day_locale;

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
        '$state',
        '$sce',
        'appConfigs',
        'FundService',
        'ModalService',
        'VoucherService',
        ProductComponent
    ],
    templateUrl: 'assets/tpl/pages/product.html'
};