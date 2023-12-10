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

    const updateActivePreCheck = () => {
        $ctrl.activePreCheck = $ctrl.preChecks[$ctrl.activeStepIndex];
    };

    const isLastPreCheck = () => {
        return $ctrl.activeStepIndex == $ctrl.preChecks.length - 1;
    };

    $ctrl.activePreCheckFilled = () => {
        return $ctrl.activePreCheck.record_types.filter(pre_check_record => {
            return pre_check_record.input_value || pre_check_record.control_type == 'ui_control_checkbox';
        }).length == $ctrl.activePreCheck.record_types.length;
    };

    $ctrl.submitPreChecks = () => {
        $timeout(() => {
            if (!isLastPreCheck() && !$ctrl.showTotals) {
                return;
            }

            const recordsData = $ctrl.preChecks.reduce((recordsData, preCheck) => {
                return [
                    ...recordsData,
                    ...preCheck.record_types.reduce((recordData, record) => {
                        return [
                            ...recordData, 
                            {
                                key: record.record_type_key,
                                value: record.input_value?.toString(),
                            }
                        ];
                    }, [])
                ];
            }, []);

            return $q((resolve, reject) => {
                PreCheckService.calculateTotals({
                    records: recordsData,
                    ...$ctrl.form.values,
                }).then((res) => {
                    resolve($ctrl.totals = res.data);
                    $ctrl.showTotals = true;
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
            return;
        }

        if ($ctrl.activeStepIndex < $ctrl.preChecks.length && $ctrl.activePreCheckFilled()) {
            $ctrl.activeStepIndex++;
            updateActivePreCheck();
        }
    };

    $ctrl.setRecordValue = (criteria) => $timeout(() => {
        criteria.input_value = criteria.is_checked ? criteria.value : null;
    }, 250);
    
    $ctrl.setShowMorePreCheckInfo = (e, showMorePreCheckInfo = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $ctrl.showMorePreCheckInfo = showMorePreCheckInfo;
    };

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

        $ctrl.preChecks = $ctrl.preChecks.map((preCheck) => ({
            ...preCheck,
            record_types: preCheck.record_types.map((pre_check_record) => ({
                ...pre_check_record,
                label: FundService.getCriterionLabelValue(pre_check_record.record_type),
                control_type: FundService.getCriterionControlType(pre_check_record.record_type),
                input_value: FundService.getCriterionControlDefaultValue(pre_check_record.record_type),
            }))
        }));

        updateActivePreCheck();
    };
};

module.exports = {
    bindings: {
        tags: '<',
        preChecks: '<',
        recordTypes: '<',
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