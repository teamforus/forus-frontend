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
    $ctrl.appConfigs = appConfigs;

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
            let validators = fund.validators.map(function(validator) {
                return validator.identity_address;
            });

            fund.vouchers = $ctrl.vouchers.filter(voucher => {
                return voucher.fund_id == fund.id;
            });

            fund.isApplicable = fund.criteria.filter(criterion => {
                return FundService.checkEligibility(
                    $ctrl.recordsByKey[criterion.record_type_key] || [],
                    criterion,
                    validators,
                    fund.organization_id
                );
            }).length == fund.criteria.length;

            fund.alreadyReceived = fund.vouchers.length !== 0;

            fund.criterioaList = FundService.fundCriteriaList(
                fund.criteria,
                $ctrl.recordsByTypesKey
            );

            fund.voucherStateName = 'vouchers';
            if (fund.vouchers[0] && fund.vouchers[0].address) {
                fund.voucherStateName = 'voucher({ address: fund.vouchers[0].address })';
            }

            return fund;
        });

        $ctrl.applyFund = function(fund) {
            FundService.apply(fund.id).then(function(res) {
                $state.go('voucher', res.data.data);
            }, console.error);
        };
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