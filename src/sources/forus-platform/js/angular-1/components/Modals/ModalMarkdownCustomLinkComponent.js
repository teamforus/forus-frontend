let ModalMarkdownCustomLinkComponent = function(
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.params = {
            type: $ctrl.modal.scope.type,
            description: $ctrl.modal.scope.selection
        };

        $ctrl.form = FormBuilderService.build({}, (form) => {
            $ctrl.modal.scope.success(form.values);

            $ctrl.close();
        });
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        type: '='
    },
    controller: [
        'FormBuilderService',
        ModalMarkdownCustomLinkComponent
    ],
    templateUrl: () => {
        return '/assets/tpl/modals/modal-markdown-custom-link.html';
    }
};