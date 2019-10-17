let FundsComponent2 = function(
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
        if (Array.isArray($ctrl.records)) {
            $ctrl.records.forEach(function(record) {
                if (!$ctrl.recordsByKey[record.key]) {
                    $ctrl.recordsByKey[record.key] = [];
                }
    
                $ctrl.recordsByKey[record.key].push(record);
            });
        }

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });

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

            fund.alreadyReceived = $ctrl.vouchers.filter(voucher => {
                return voucher.fund_id == fund.id;
            }).length !== 0;

            fund.criterioaList = FundService.fundCriteriaList(
                fund.criteria,
                $ctrl.recordsByTypesKey
            );

            return fund;
        });

        $ctrl.applyFund = function(fund) {
            FundService.apply(fund.id).then(function(res) {
                $state.go('voucher', res.data.data);
            }, console.error);
        };

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
        FundsComponent2
    ],
    templateUrl: 'assets/tpl/pages/funds-2.html'
};