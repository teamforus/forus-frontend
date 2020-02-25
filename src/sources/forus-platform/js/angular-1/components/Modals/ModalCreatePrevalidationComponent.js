let sprintf = require('sprintf-js').sprintf;

let ModalCreatePrevalidationComponent = function(
    FormBuilderService,
    PrevalidationService
) {
    let $ctrl = this;

    $ctrl.recordTypesAvailable = [];

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

        $ctrl.prevalidationRecords = $ctrl.fund.csv_required_keys;
        
        if (fundRecordKey && fundRecordKeyValue) {
            $ctrl.prevalidationRecords = $ctrl.prevalidationRecords.filter(prevalidationRecord => {
                return prevalidationRecord !== fundRecordKey
            });
        }

        $ctrl.updateRecordTypesAvailable();

        $ctrl.recordTypes.forEach((recordType) => {
            $ctrl.recordTypesByKey[recordType.key] = recordType;
        });

        $ctrl.fund.criteria.forEach((criteria) => {
            $ctrl.criteriaRuleByKey[criteria.record_type_key] = sprintf(
                "%s %s", {
                    '>': 'more than',
                    '<': 'less than',
                    '=': 'is'
                } [criteria.operator],
                criteria.value
            )

            if (criteria.operator == '=') {
                values[criteria.record_type_key] = criteria.value;
            }
        });

        $ctrl.form = FormBuilderService.build(values, function(form) {
            let values = JSON.parse(JSON.stringify(form.values));

            if (fundRecordKey && fundRecordKeyValue) {
                values[fundRecordKey] = fundRecordKeyValue;
            }

            PrevalidationService.submit(values, $ctrl.fund.id).then((res) => {
                $ctrl.prevalidation = res.data.data;
            }, (res) => {
                form.unlock();
                $ctrl.form.errors = res.data.errors;
            });
        }, true);
    };

    $ctrl.updateRecordTypesAvailable = () => {
        $ctrl.recordTypesAvailable = $ctrl.recordTypes.filter(
            recordType => $ctrl.prevalidationRecords.indexOf(recordType.key) === -1
        );
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
    $ctrl.closeModal = () => {
        if ($ctrl.prevalidation) {
            $ctrl.modal.scope.onPrevalidationCreated($ctrl.prevalidation)
        }

        $ctrl.close();
    };

    $ctrl.$onDestroy = function() {};
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