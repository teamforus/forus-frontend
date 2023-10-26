const ModalCreatePrevalidationComponent = function (
    FormBuilderService,
    PrevalidationService
) {
    const $ctrl = this;

    $ctrl.recordTypesAvailable = [];
    $ctrl.eligibleKey = false;
    $ctrl.eligibleKeyValue = false;

    $ctrl.$onInit = () => {
        const values = {};
        const { fund, recordTypes } = $ctrl.modal.scope;
        const { criteria } = fund;

        const eligibleKey = fund.csv_required_keys.find((key) => {
            return key.endsWith('_eligible');
        });

        const eligibleKeyValue = criteria.find((criterion) => {
            return criterion.record_type.key == eligibleKey && criterion.operator == '=';
        })?.value;

        $ctrl.fund = fund;
        $ctrl.recordTypes = recordTypes.filter((type) => type.key != 'primary_email');
        $ctrl.recordTypesByKey = recordTypes.reduce((obj, type) => ({ ...obj, [type.key]: type }), {});;
        $ctrl.criteriaRuleByKey = {};

        $ctrl.eligibleKey = eligibleKey;
        $ctrl.eligibleKeyValue = eligibleKeyValue;
        $ctrl.prevalidationRecords = [...fund.csv_required_keys]

        $ctrl.updateRecordTypesAvailable();

        fund.criteria.forEach((criteria) => {
            const operatorLocale = {
                '<': 'minder dan',
                '>': 'meer dan',
                '=': 'is',
                '*': 'elk',
            }[criteria.operator];

            $ctrl.criteriaRuleByKey[criteria.record_type.key] = `${operatorLocale} ${criteria.value}`;

            if (criteria.operator == '=') {
                values[criteria.record_type.key] = criteria.value;
            }
        });

        $ctrl.form = FormBuilderService.build(values, function (form) {
            if (!$ctrl.verificationRequested) {
                return $ctrl.requestVerification() & form.unlock();
            }

            const values = {...form.values};

            if (eligibleKey && eligibleKeyValue) {
                values[eligibleKey] = eligibleKeyValue;
            }

            PrevalidationService.submit(values, fund.id).then((res) => {
                $ctrl.backToForm();
                $ctrl.prevalidation = res.data.data;
                $ctrl.prevalidationPrimaryKey = $ctrl.prevalidation.records.filter((record) => {
                    return record.key == fund.csv_primary_key;
                })[0] || false;
            }, (res) => {
                $ctrl.form.errors = res.data.errors;

                form.unlock();
                $ctrl.backToForm();
            });
        }, true);
    };

    $ctrl.requestVerification = () => {
        $ctrl.verificationRequested = true;
    };

    $ctrl.backToForm = () => {
        $ctrl.verificationRequested = false;
    };

    $ctrl.updateRecordTypesAvailable = () => {
        $ctrl.recordTypesAvailable = $ctrl.recordTypes.filter((recordType) => {
            return !$ctrl.prevalidationRecords.includes(recordType.key);
        });

        if ($ctrl.eligibleKey && $ctrl.eligibleKeyValue) {
            $ctrl.recordTypesAvailable = $ctrl.recordTypesAvailable.filter((record) => record !== $ctrl.eligibleKey);
            $ctrl.prevalidationRecords = $ctrl.prevalidationRecords.filter((record) => record !== $ctrl.eligibleKey);
        }
    };

    $ctrl.addNewRecord = () => {
        $ctrl.formNewRecord = FormBuilderService.build({
            record_type_key: $ctrl.recordTypesAvailable[0].key,
        }, () => { })
    };

    $ctrl.submitNewRecord = () => {
        $ctrl.prevalidationRecords.push($ctrl.formNewRecord.values.record_type_key);
        $ctrl.formNewRecord = false;
        $ctrl.updateRecordTypesAvailable();
    };

    $ctrl.removeExtraRecord = (recordKey) => {
        if ($ctrl.prevalidationRecords.includes(recordKey)) {
            $ctrl.prevalidationRecords.splice($ctrl.prevalidationRecords.indexOf(recordKey), 1);
            delete $ctrl.form.values[recordKey]
        }

        $ctrl.updateRecordTypesAvailable();
    };

    $ctrl.closeModal = () => {
        if ($ctrl.prevalidation) {
            $ctrl.modal.scope.onPrevalidationCreated($ctrl.prevalidation)
        }

        $ctrl.close();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'PrevalidationService',
        ModalCreatePrevalidationComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-create-prevalidation.html';
    }
};
