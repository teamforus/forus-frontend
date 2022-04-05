let sprintf = require('sprintf-js').sprintf;

let ModalCreatePrevalidationComponent = function(
    FormBuilderService,
    PrevalidationService
) {
    let $ctrl = this;

    $ctrl.recordTypesAvailable = [];
    $ctrl.fundRecordKey = false;
    $ctrl.fundRecordKeyValue = false;

    $ctrl.$onInit = () => {
        let values = {};

        $ctrl.recordTypes = $ctrl.modal.scope.recordTypes.filter(
            recordType => recordType.key != 'primary_email'
        );

        $ctrl.recordTypesByKey = {};
        $ctrl.criteriaRuleByKey = {};

        $ctrl.fund = $ctrl.modal.scope.fund;

        let fundRecordKey = $ctrl.fund.csv_required_keys.filter(key => {
            return key.indexOf('_eligible') === key.length - 9;
        })[0] || false;

        let fundRecordKeyValue = ($ctrl.fund.criteria.filter(
            criteria => criteria.record_type_key == fundRecordKey && criteria.operator == '='
        )[0] || false).value || false;

        $ctrl.fundRecordKey = fundRecordKey;
        $ctrl.fundRecordKeyValue = fundRecordKeyValue;
        $ctrl.prevalidationRecords = $ctrl.fund.csv_required_keys.slice();

        $ctrl.updateRecordTypesAvailable();

        $ctrl.recordTypes.forEach((recordType) => {
            $ctrl.recordTypesByKey[recordType.key] = recordType;
        });

        $ctrl.fund.criteria.forEach((criteria) => {
            $ctrl.criteriaRuleByKey[criteria.record_type_key] = sprintf(
                "%s %s", {
                    '>': 'meer dan',
                    '<': 'minder dan',
                    '=': 'is'
                } [criteria.operator],
                criteria.value
            )

            if (criteria.operator == '=') {
                values[criteria.record_type_key] = criteria.value;
            }
        });

        $ctrl.form = FormBuilderService.build(values, function(form) {
            if (!$ctrl.verificationRequested) {
                return $ctrl.requestVerification() & form.unlock();
            }

            let values = JSON.parse(JSON.stringify(form.values));

            if (fundRecordKey && fundRecordKeyValue) {
                values[fundRecordKey] = fundRecordKeyValue;
            }

            PrevalidationService.submit(values, $ctrl.fund.id).then((res) => {
                $ctrl.backToForm();
                $ctrl.prevalidation = res.data.data;
                $ctrl.prevalidationPrimaryKey = $ctrl.prevalidation.records.filter(
                    record => record.key == $ctrl.fund.csv_primary_key
                )[0] || false;
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
        $ctrl.recordTypesAvailable = $ctrl.recordTypes.filter(
            recordType => $ctrl.prevalidationRecords.indexOf(recordType.key) === -1
        );

        if ($ctrl.fundRecordKey && $ctrl.fundRecordKeyValue) {
            $ctrl.recordTypesAvailable = $ctrl.recordTypesAvailable.filter(
                prevalidationRecord => prevalidationRecord !== $ctrl.fundRecordKey
            );

            $ctrl.prevalidationRecords = $ctrl.prevalidationRecords.filter(
                prevalidationRecord => prevalidationRecord !== $ctrl.fundRecordKey
            );
        }
    };

    $ctrl.addNewRecord = () => {
        $ctrl.formNewRecord = FormBuilderService.build({
            record_type_key: $ctrl.recordTypesAvailable[0].key,
        }, () => {})
    };

    $ctrl.submitNewRecord = () => {
        $ctrl.prevalidationRecords.push($ctrl.formNewRecord.values.record_type_key);
        $ctrl.formNewRecord = false;
        $ctrl.updateRecordTypesAvailable();
    };

    $ctrl.removeExtraRecord = (recordKey) => {
        let index = $ctrl.prevalidationRecords.indexOf(recordKey);

        if (index !== -1) {
            $ctrl.prevalidationRecords.splice(index, 1);
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
