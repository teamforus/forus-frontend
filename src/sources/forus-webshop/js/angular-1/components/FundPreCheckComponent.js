const FundPreCheckComponent = function (
    $q,
    $timeout,
    FundService,
    PreCheckService,
) {
    const $ctrl = this;

    $ctrl.activeStepIndex = 0;
    $ctrl.showTotals = false;

    $ctrl.sortByOptions = [{
        label: 'Nieuwe eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'desc',
        }
    }, {
        label: 'Oudste eerst',
        value: {
            order_by: 'created_at',
            order_by_dir: 'asc',
        }
    }, {
        label: 'Naam (oplopend)',
        value: {
            order_by: 'name',
            order_by_dir: 'asc',
        }
    }, {
        label: 'Naam (aflopend)',
        value: {
            order_by: 'name',
            order_by_dir: 'desc',
        }
    }];

    const mapPreCheckRecords = () => {
        $ctrl.preChecks = $ctrl.preChecks.map(preCheck => ({
            ...preCheck,
            pre_check_records: preCheck.pre_check_records.map(pre_check_record => ({
                ...pre_check_record,
                control_type: FundService.getControlType(pre_check_record.record_type),
                input_value: FundService.getControlDefaultValue(pre_check_record.record_type),
            }))
        }));
    };

    const updateActivePreCheck = () => {
        $ctrl.activePreCheck = $ctrl.preChecks[$ctrl.activeStepIndex];
    };

    $ctrl.activePreCheckFilled = () => {
        return $ctrl.activePreCheck.pre_check_records.filter(pre_check_record => {
            return pre_check_record.input_value !== '' || pre_check_record.control_type == 'ui_control_checkbox';
        }).length;
    };

    $ctrl.submitPreChecks = () => {
        return $q((resolve, reject) => {
            PreCheckService.calculateTotals({
                pre_checks: $ctrl.preChecks
            }).then((res) => {
                resolve($ctrl.totals = res.data);
            }, reject);
        });
    };

    $ctrl.changeAnswers = () => {
        $ctrl.activeStepIndex = 0;
        updateActivePreCheck();
    };

    $ctrl.prev = () => {
        if ($ctrl.activeStepIndex > 0) {
            $ctrl.activeStepIndex--;
            updateActivePreCheck();
        }
    };

    $ctrl.next = () => {
        // Last step - get the totals
        if ($ctrl.activeStepIndex == $ctrl.preChecks.length - 1) {
            $ctrl.submitPreChecks();
            $ctrl.showTotals = true;
        }

        if ($ctrl.activeStepIndex < $ctrl.preChecks.length && $ctrl.activePreCheckFilled()) {
            $ctrl.activeStepIndex++;
            updateActivePreCheck();
        }
    };

    $ctrl.setRecordValue = (criteria) => $timeout(() => {
        criteria.input_value = criteria.is_checked ? 1 : 0;
    }, 250);

    $ctrl.$onInit = function () {
        $ctrl.recordTypesByKey = $ctrl.recordTypes.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});

        mapPreCheckRecords();
        updateActivePreCheck();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        preChecks: '<',
        recordTypes: '<',
    },
    controller: [
        '$q',
        '$timeout',
        'FundService',
        'PreCheckService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};