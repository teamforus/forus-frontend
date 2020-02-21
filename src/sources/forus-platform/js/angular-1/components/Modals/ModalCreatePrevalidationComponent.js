let sprintf = require('sprintf-js').sprintf;

let ModalCreatePrevalidationComponent = function(
    FormBuilderService,
    PrevalidationService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let values = {};

        $ctrl.recordTypes = $ctrl.modal.scope.recordTypes;
        $ctrl.recordTypesByKey = {};
        $ctrl.criteriaRuleByKey = {};

        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.fundRecords = $ctrl.fund.csv_required_keys.filter(
            key => key.indexOf('_eligible') == -1
        );

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
            PrevalidationService.submit(
                form.values,
                $ctrl.fund.id
            ).then((res) => {
                $ctrl.prevalidation = res.data.data;
            }, (res) => {
                form.unlock();
                $ctrl.form.errors = res.data.errors;
            });
        }, true);
    };

    $ctrl.closeModal = () => {
        $ctrl.modal.scope.onClose();
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