let ModalFundCriteriaDescriptionEditComponent = function(
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.form = FormBuilderService.build({
            description: $ctrl.modal.scope.description
        }, (form) => {
            $ctrl.modal.scope.success(form.values);

            $ctrl.close();
        });
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
        ModalFundCriteriaDescriptionEditComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-fund-criteria-description.html';
    }
};