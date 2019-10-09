let FundsComponent = function(
    $state,
    appConfigs,
    FundService
) {
    let $ctrl = this;

    if (!appConfigs.features || !appConfigs.features.funds.list) {
        return $state.go('home');
    }

    $ctrl.recordsByKey = {};
    $ctrl.recordsByTypesKey = {};

    $ctrl.$onInit = function() {
        $ctrl.records.forEach(function(record) {
            if (!$ctrl.recordsByKey[record.key]) {
                $ctrl.recordsByKey[record.key] = [];
            }

            $ctrl.recordsByKey[record.key].push(record);
        });

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });

        // Filter already applied funds
        /* $ctrl.funds = $ctrl.funds.filter(fund => $ctrl.vouchers.filter(voucher => {
            return voucher.fund_id == fund.id;
        }).length == 0); */

        $ctrl.funds = $ctrl.funds.map(function(fund) {
            fund.categories = fund.product_categories.map(function(category) {
                return category.name;
            }).join(', ');

            let validators = fund.validators.map(function(validator) {
                return validator.identity_address;
            });

            fund.isApplicable = fund.criteria.filter(criterion => {
                return FundService.checkEligibility(
                    $ctrl.recordsByKey[criterion.record_type_key] || [],
                    criterion,
                    validators,
                    fund.organization_id
                );
            }).length == fund.criteria.length;

            fund.criterioaList = FundService.fundCriteriaList(
                fund.criteria,
                $ctrl.recordsByTypesKey
            );

            return fund;
        });

        // Filter non applicable funds
        // $ctrl.funds = $ctrl.funds.filter(fund => fund.isApplicable);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        records: '<',
        vouchers: '<',
        recordTypes: '<',
    },
    controller: [
        '$state',
        'appConfigs',
        'FundService',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/funds.html'
};