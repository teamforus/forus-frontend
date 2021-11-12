const FundsComponent = function(
    $sce,
    $state,
    $stateParams,
    appConfigs,
    FundService,
    ModalService
) {
    const $ctrl = this;

    $ctrl.fundLogo = null;
    $ctrl.appConfigs = appConfigs;
    $ctrl.recordsByTypesKey = {};

    $ctrl.applyFund = function(fund) {
        if ($ctrl.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        FundService.apply(fund.id).then(function(res) {
            $state.go('voucher', res.data.data);
        }, console.error);
    };

    $ctrl.updateFundsMeta = () => {
        $ctrl.fund.vouchers = $ctrl.vouchers.filter(voucher => voucher.fund_id == $ctrl.fund.id && !voucher.expired);
        $ctrl.fund.isApplicable = $ctrl.fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
        $ctrl.fund.alreadyReceived = $ctrl.fund.vouchers.length !== 0;
        $ctrl.fund.voucherStateName = 'vouchers';

        $ctrl.fund.showRequestButton = !$ctrl.fund.alreadyReceived &&
            $ctrl.fund.allow_direct_requests &&
            !$ctrl.fund.has_pending_fund_requests &&
            !$ctrl.fund.isApplicable &&
            $ctrl.configs.funds.fund_requests;

        $ctrl.fund.showPendingButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.has_pending_fund_requests;
        $ctrl.fund.showActivateButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.isApplicable;
        $ctrl.fund.showReceivedButton = $ctrl.fund.alreadyReceived;

        if ($ctrl.fund.vouchers[0] && $ctrl.fund.vouchers[0].address) {
            $ctrl.fund.voucherStateName = 'voucher({ address: $ctrl.fund.vouchers[0].address })';
        }
    };

    $ctrl.$onInit = function() {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.updateFundsMeta();

        $ctrl.criteriaList = $ctrl.fund.criteria;
        $ctrl.fundLogo = $ctrl.fund.logo || $ctrl.fund.organization.logo;

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });

        $ctrl.formulaList = {
            fixed: $ctrl.fund.formulas.filter(formula => formula.type == 'fixed'),
            multiply: $ctrl.fund.formulas.filter(formula => formula.type == 'multiply').map(multiply => ({
                amount: multiply.amount,
                label: ($ctrl.recordsByTypesKey[multiply.record_type_key] || {
                    name: multiply.record_type_key
                }).name,
            })),
        };

        if ($ctrl.fund.faq) {
            $ctrl.fund.faq = $ctrl.fund.faq.map(question => {
                question.description_html = $sce.trustAsHtml(question.description_html);
                return question;
            });
        }
    };
};

module.exports = {
    bindings: {
        fund: '<',
        configs: '<',
        vouchers: '<',
        products: '<',
        subsidies: '<',
        recordTypes: '<',
        searchData: '<',
    },
    controller: [
        '$sce',
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        'ModalService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund.html'
};