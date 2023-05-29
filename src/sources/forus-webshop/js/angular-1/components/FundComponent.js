const FundsComponent = function (
    $rootScope,
    $sce,
    $filter,
    $state,
    $stateParams,
    appConfigs,
    FundService
) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

    $ctrl.fundLogo = null;
    $ctrl.appConfigs = appConfigs;
    $ctrl.recordsByTypesKey = {};

    $ctrl.applyFund = function ($e, fund) {
        $e.preventDefault();

        if ($ctrl.fund.taken_by_partner) {
            return FundService.showTakenByPartnerModal();
        }

        $state.go('fund-activate', { fund_id: fund.id });
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

        $ctrl.fund.showExternalLink = $ctrl.fund.external_link_text && $ctrl.fund.external_link_url;

        $ctrl.fund.showPendingButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.has_pending_fund_requests;
        $ctrl.fund.showActivateButton = !$ctrl.fund.alreadyReceived && $ctrl.fund.isApplicable;
        $ctrl.fund.showReceivedButton = $ctrl.fund.alreadyReceived;

        $ctrl.linkPrimaryButton = [
            $ctrl.fund.showRequestButton,
            $ctrl.fund.showPendingButton,
            $ctrl.fund.showActivateButton,
            $ctrl.fund.alreadyReceived,
        ].filter((flag) => flag).length === 0;
    };

    $ctrl.$onInit = function () {
        $ctrl.searchData = $stateParams.searchData || null;
        $ctrl.updateFundsMeta();

        $ctrl.fundLogo = $ctrl.fund.logo || $ctrl.fund.organization.logo;
        $ctrl.criteriaList = $ctrl.fund.criteria;
        $ctrl.fund.description_html = $sce.trustAsHtml($ctrl.fund.description_html);

        $ctrl.recordTypes.forEach(function (recordType) {
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

        $rootScope.pageTitle = $i18n('page_state_titles.fund', {
            fund_name: $ctrl.fund.name,
            implementation: $i18n(`implementation_name.${appConfigs.client_key}`),
            organization_name: $ctrl.fund.organization.name,
        });
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
        '$rootScope',
        '$sce',
        '$filter',
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund.html'
};