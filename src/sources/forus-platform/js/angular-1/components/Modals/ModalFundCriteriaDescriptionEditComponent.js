let ModalFundCriteriaDescriptionEditComponent = function(
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.criterion = $ctrl.modal.scope.criterion;
        $ctrl.validateCriteria = $ctrl.modal.scope.validateCriteria;

        $ctrl.form = FormBuilderService.build({
            description_html: $ctrl.modal.scope.description_html,
            description: $ctrl.modal.scope.description,
            title: $ctrl.modal.scope.title
        }, (form) => {
            form.errors = {};
            $ctrl.validateCriteria(Object.assign(JSON.parse(JSON.stringify(
                $ctrl.criterion
            )), {
                title: form.values.title,
                description: form.values.description,
            })).then(() => {
                $ctrl.modal.scope.success(form.values);
                $ctrl.close();
            }, res => {
                if (Object.keys(res.data.errors).filter(key => {
                    return key.endsWith('.title') || key.endsWith('.description');
                }).length > 0) {
                    form.errors = res.data.errors;
                } else {
                    $ctrl.modal.scope.success(form.values);
                    $ctrl.close();
                }
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        ModalFundCriteriaDescriptionEditComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-criteria-description.html';
    }
};