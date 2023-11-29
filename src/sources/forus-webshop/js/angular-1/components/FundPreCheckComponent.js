const FundPreCheckComponent = function (
    $q,
    $timeout,
    FundService,
    PreCheckService,
    FormBuilderService,
) {
    const $ctrl = this;

    $ctrl.activeStepIndex = 0;
    $ctrl.showTotals = false;

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

    const isLastPreCheck = () => {
        return $ctrl.activeStepIndex == $ctrl.preChecks.length - 1;
    };

    $ctrl.activePreCheckFilled = () => {
        return $ctrl.activePreCheck.pre_check_records.filter(pre_check_record => {
            return pre_check_record.input_value !== '' || pre_check_record.control_type == 'ui_control_checkbox';
        }).length;
    };

    $ctrl.submitPreChecks = () => {
        $timeout(() => {
            if (!isLastPreCheck() && !$ctrl.showTotals) {
                return;
            }
    
            return $q((resolve, reject) => {
                PreCheckService.calculateTotals({
                    pre_checks: $ctrl.preChecks,
                    ...$ctrl.form.values,
                }).then((res) => {
                    resolve($ctrl.totals = res.data);
                }, reject);
            });
        }, 10);
    };

    $ctrl.changeAnswers = () => {
        $ctrl.activeStepIndex = 0;
        $ctrl.showTotals = false;
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
        if (isLastPreCheck()) {
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

        $ctrl.tags.unshift({
            id: null,
            name: 'Alle categorieën',
        });

        $ctrl.organizations.unshift({
            id: null,
            name: 'Alle organisaties',
        });

        $ctrl.form = FormBuilderService.build({
            q: '',
            tag_id: null,
            organization_id: null,
        });

        mapPreCheckRecords();
        updateActivePreCheck();
    };
};

module.exports = {
    bindings: {
        preChecks: '<',
        recordTypes: '<',
        tags: '<',
        organizations: '<',
    },
    controller: [
        '$q',
        '$timeout',
        'FundService',
        'PreCheckService',
        'FormBuilderService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};