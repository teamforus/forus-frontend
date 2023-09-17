const FundsComponent = function (
    $sce,
    $state,
    $filter,
    $rootScope,
    $stateParams,
    FundService,
    appConfigs,
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
        $ctrl.fund = FundService.mapFund($ctrl.fund, $ctrl.vouchers, $ctrl.configs);
    };

    $ctrl.$onInit = function () {
        if ($ctrl.fund.external_page && $ctrl.fund.external_page_url) {
            return document.location = $ctrl.fund.external_page_url;
        }

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
        '$sce',
        '$state',
        '$filter',
        '$rootScope',
        '$stateParams',
        'FundService',
        'appConfigs',
        FundsComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund.html',
};