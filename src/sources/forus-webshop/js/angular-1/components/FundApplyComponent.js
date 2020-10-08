let FundsComponent = function(
    $state,
    FundService,
    RecordService,
    appConfigs
) {
    let $ctrl = this;

    if (!appConfigs.features || !appConfigs.features.funds.list) {
        return $state.go('home');
    }

    $ctrl.recordsByKey = {};
    $ctrl.recordsByTypesKey = {};
    $ctrl.countInvalid = 0;
    $ctrl.state = 'list_records';
    $ctrl.stepState = 'criteria';
    $ctrl.step = 1;

    $ctrl.checkStates = function(isValid) {
        if (!isValid) {
            $ctrl.countInvalid++;
        }
    };

    $ctrl.addMissingRecords = function() {
        $ctrl.state = 'add_missing';
    };

    $ctrl.buildSteps = () => {
        // criteria list
        let totalSteps = 1;

        // Other criteria
        totalSteps += $ctrl.invalidCriteria.length;

        $ctrl.totalSteps = [];

        for (let index = 0; index < totalSteps; index++) {
            $ctrl.totalSteps.push(index + 1);
        }
    };

    $ctrl.step2state = (step) => {
        if (step == 1) {
            return 'criteria';
        }

        if (step > $ctrl.totalSteps.length) {
            return 'done';
        }

        let prevSteps = 1;

        return 'criteria_' + ((step - prevSteps) - 1);
    };

    $ctrl.nextStep = () => {
        $ctrl.step++;
        $ctrl.updateState();
    };

    $ctrl.reload = () => {
        $state.reload();
    };

    $ctrl.updateState = () => {
        $ctrl.stepState = $ctrl.step2state($ctrl.step);
    };

    $ctrl.$onInit = function() {
        /* if ($ctrl.vouchers.filter(voucher => {
            return voucher.fund_id == $ctrl.fund.id;
        }).length > 0) {
            return $state.go('home');
        } */

        $ctrl.records.forEach(function(record) {
            if (!$ctrl.recordsByKey[record.key]) {
                $ctrl.recordsByKey[record.key] = [];
            }

            $ctrl.recordsByKey[record.key].push(record);
        });

        $ctrl.recordTypes.forEach(function(recordType) {
            $ctrl.recordsByTypesKey[recordType.key] = recordType;
        });

        $ctrl.criterioaList = FundService.fundCriteriaList(
            $ctrl.fund.criteria,
            $ctrl.recordsByTypesKey
        );

        $ctrl.invalidCriteria = $ctrl.fund.criteria.filter(criterion => !criterion.is_valid);

        $ctrl.formulaList = {
            fixed: $ctrl.fund.formulas.filter(formula => {
                return formula.type == 'fixed'
            }),
            multiply: $ctrl.fund.formulas.filter(formula => {
                return formula.type == 'multiply'
            }).map(multiply => {
                return {
                    amount: multiply.amount,
                    label: $ctrl.recordsByTypesKey[multiply.record_type_key].name
                }
            }),
        }; 

        $ctrl.buildSteps();
    };

    $ctrl.applyFund = function() {
        FundService.apply($ctrl.fund.id).then(function(res) {
            $state.go('voucher', res.data.data);
        }, console.error);
    };
};

module.exports = {
    bindings: {
        fund: '<',
        records: '<',
        vouchers: '<',
        recordTypes: '<',
    },
    controller: [
        '$state',
        'FundService',
        'RecordService',
        'appConfigs',
        FundsComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-apply.html'
};