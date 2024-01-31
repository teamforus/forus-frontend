const FundPreCheckComponent = function (
    $state,
    $timeout,
    FundService,
    FileService,
    PreCheckService,
    FormBuilderService,
    PageLoadingBarService,
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

    const mapRecords = () => {
        return $ctrl.preChecks.reduce((recordsData, preCheck) => [
            ...recordsData,
            ...preCheck.record_types.reduce((recordData, record) => [
                ...recordData,
                { key: record.record_type_key, value: record.input_value?.toString() || '' },
            ], [])
        ], []);
    };

    $ctrl.preCheckFilled = (index) => {
        const activePreCheck = $ctrl.preChecks[index];
        const filledRecordTypes = activePreCheck.record_types.filter((pre_check_record) => {
            return pre_check_record.input_value ||
                pre_check_record.input_value === 0 ||
                pre_check_record.control_type === 'ui_control_checkbox';
        });
        const recordTypeKeys = activePreCheck.record_types.map((recordType) => recordType.record_type_key);
        const filledRecordTypeKeys = filledRecordTypes.map((recordType) => recordType.record_type_key);
        
        $ctrl.emptyRecordTypeKeys = recordTypeKeys.filter((recordTypeKey) => {
            return !filledRecordTypeKeys.includes(recordTypeKey);
        });

        return !$ctrl.emptyRecordTypeKeys.length;
    };

    $ctrl.fetchPreCheckTotals = (query) => {
        const records = mapRecords();

        PreCheckService.calculateTotals({ ...query, records })
            .then((res) => $ctrl.totals = res.data)
            .catch((res) => PushNotificationsService.danger(res.data.message));
    };

    $ctrl.changeAnswers = () => {
        $ctrl.totals = null;
        $ctrl.activeStepIndex = 0;
    };

    $ctrl.downloadPDF = () => {
        const records = mapRecords();

        PreCheckService.downloadPDF({ ...$ctrl.form.values, records })
            .then((res) => {
                PushNotificationsService.success('Success!', 'The downloading should start shortly.');

                const fileName = [
                    'pre-check',
                    moment().format('YYYY-MM-DD HH:mm:ss') + '.pdf'
                ].join('_');

                FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
                PageLoadingBarService.setProgress(100);
            }).catch((res) => {
                console.log('res: ', res);
                PushNotificationsService.danger(res.data.message);
            });
    };

    $ctrl.prev = () => {
        $ctrl.activeStepIndex = Math.max($ctrl.activeStepIndex - 1, 0);
    };

    $ctrl.next = () => {
        const isLastPreCheck = $ctrl.activeStepIndex == $ctrl.preChecks.length - 1;

        if ($ctrl.preCheckFilled($ctrl.activeStepIndex)) {
            if (isLastPreCheck) {
                return $ctrl.fetchPreCheckTotals($ctrl.form.values);
            }

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
        'FileService',
        'PreCheckService',
        'FormBuilderService',
        'PageLoadingBarService',
        'PushNotificationsService',
        FundPreCheckComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-pre-check.html',
};