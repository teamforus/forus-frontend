const FundsComponent = function(
    $sce,
    $state,
    $stateParams,
    $filter,
    appConfigs,
    FundService
) {
    const $ctrl = this;

    let $translate = $filter('translate');

    let trans = (key) => {
        let transKey = 'funds.buttons.' + appConfigs.client_key + '.' + key;

        if ($translate(transKey) && $translate(transKey) != transKey) {
            return $translate(transKey);
        }

        return $translate('funds.buttons.' + key);
    }

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
        $ctrl.fund.isApplicable = $ctrl.fund.criteria.length > 0 && $ctrl.fund.criteria.filter(criterion => !criterion.is_valid).length == 0;
        $ctrl.fund.alreadyReceived = $ctrl.fund.vouchers.length !== 0;
        $ctrl.fund.voucherStateName = 'vouchers';

        $ctrl.fund.showRequestButton = 
            !$ctrl.fund.alreadyReceived &&
            !$ctrl.fund.has_pending_fund_requests &&
            !$ctrl.fund.isApplicable &&
            $ctrl.fund.allow_direct_requests && 
            $ctrl.configs.funds.fund_requests;

        $ctrl.fund.showRequestLinkButton = 
            !$ctrl.fund.alreadyReceived &&
            !$ctrl.fund.has_pending_fund_requests &&
            !$ctrl.fund.isApplicable &&
            !$ctrl.fund.allow_direct_requests && 
            $ctrl.configs.funds.fund_requests &&
            $ctrl.fund.request_btn_text &&
            $ctrl.fund.request_btn_url;

        $ctrl.fund.showPendingButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.has_pending_fund_requests;
        $ctrl.fund.showActivateButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.isApplicable;
        $ctrl.fund.showReceivedButton = $ctrl.fund.alreadyReceived;

        if ($ctrl.fund.vouchers[0] && $ctrl.fund.vouchers[0].address) {
            $ctrl.fund.voucherStateName = 'voucher({ address: $ctrl.fund.vouchers[0].address })';
        }

        $ctrl.fund.requestButtonText = $ctrl.fund.request_btn_text ? $ctrl.fund.request_btn_text : trans('start_request');
    };

    $ctrl.$onInit = function() {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.updateFundsMeta();

        $ctrl.fundLogo = $ctrl.fund.logo || $ctrl.fund.organization.logo;
        $ctrl.criteriaList = $ctrl.fund.criteria;
        $ctrl.fund.description_html = $sce.trustAsHtml($ctrl.fund.description_html);

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
                return { ...question, description_html: $sce.trustAsHtml(question.description_html) };
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
        '$filter',
        'appConfigs',
        'FundService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund.html'
};