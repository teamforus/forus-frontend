const FundPreCheckComponent = function (
    $state,
    $timeout,
    FundService,
    PreCheckService,
    FormBuilderService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.totals = null;
    $ctrl.activeStepIndex = 0;

    const mapPreCheck = (preCheck) => {
        // TODO: handle record_types with multiple values
        /* const record_types = preCheck.record_types.reduce((record_types, record_type) => [
            ...record_types,
            ...record_type.values.map((value) => ({ ...record_type, value }))
        ], []); */

        return {
            ...preCheck,
            record_types: preCheck.record_types.map((record_type) => ({
                ...record_type,
                label: FundService.getCriterionLabelValue(record_type.record_type, record_type.value),
                control_type: FundService.getCriterionControlType(record_type.record_type),
                input_value: FundService.getCriterionControlDefaultValue(record_type.record_type, '=', false),
            }))
        };
    };

    $ctrl.preCheckFilled = (index) => {
        const activePreCheck = $ctrl.preChecks[index];
        const filledRecordTypes = activePreCheck.record_types.filter((pre_check_record) => {
            return pre_check_record.input_value ||
                pre_check_record.input_value === 0 ||
                pre_check_record.control_type === 'ui_control_checkbox';
        });

        return filledRecordTypes.length === activePreCheck.record_types.length;
    };

    $ctrl.fetchPreCheckTotals = (query) => {
        const records = $ctrl.preChecks.reduce((recordsData, preCheck) => [
            ...recordsData,
            ...preCheck.record_types.reduce((recordData, record) => [
                ...recordData,
                { key: record.record_type_key, value: record.input_value?.toString() || '' },
            ], [])
        ], []);

        PreCheckService.calculateTotals({ ...query, records })
            .then((res) => $ctrl.totals = res.data)
            .catch((res) => PushNotificationsService.danger(res.data.message));
    };

    $ctrl.changeAnswers = () => {
        $ctrl.totals = null;
        $ctrl.activeStepIndex = 0;
    };

    $ctrl.prev = () => {
        $ctrl.activeStepIndex = Math.max($ctrl.activeStepIndex - 1, 0);
    };

    $ctrl.next = () => {
        const isLastPreCheck = $ctrl.activeStepIndex == $ctrl.preChecks.length - 1;

        if (isLastPreCheck) {
            return $ctrl.fetchPreCheckTotals($ctrl.form.values);
        }

        if ($ctrl.preCheckFilled($ctrl.activeStepIndex)) {
            $ctrl.activeStepIndex = Math.min($ctrl.activeStepIndex + 1, $ctrl.preChecks.length - 1);
        }
    };

    $ctrl.setRecordValue = (criteria) => $timeout(() => {
        criteria.input_value = criteria.is_checked ? criteria.value : null;
    }, 250);

    $ctrl.$onInit = function () {
        $ctrl.enabled = $ctrl.configs?.pre_check_enabled;
        $ctrl.recordTypesByKey = $ctrl.recordTypes.reduce((acc, type) => ({ ...acc, [type.key]: type }), {});

        if (!$ctrl.enabled) {
            PushNotificationsService.danger('Deze pagina is niet beschikbaar.');
            return $state.go('home');
        }

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

        $ctrl.preChecks = $ctrl.preChecks
            .filter((preCheck) => preCheck.record_types.length > 0)
            .map((preCheck) => mapPreCheck(preCheck));
    };
};

module.exports = {
    bindings: {
        tags: '<',
        configs: '<',
        preChecks: '<',
        recordTypes: '<',
        organizations: '<',
    },
    controller: [
        '$state',
        '$timeout',
        'FundService',
        'PreCheckService',
        'FormBuilderService',
        'PushNotificationsService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};