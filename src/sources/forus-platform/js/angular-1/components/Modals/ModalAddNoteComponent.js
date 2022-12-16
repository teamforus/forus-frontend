const ModalAddNoteComponent = function (
    FormBuilderService,
) {
    const $ctrl = this;

    $ctrl.buildForm = (values, onSubmit) => {
        return FormBuilderService.build(values, (form) => onSubmit(form, $ctrl));
    }

    $ctrl.$onInit = () => {
        const { title, description, values = {}, onSubmit } = $ctrl.modal.scope;

        $ctrl.title = title;
        $ctrl.submitting = false;
        $ctrl.description = description;
        $ctrl.form = $ctrl.buildForm(values, onSubmit);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        ModalAddNoteComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-add-note.html',
};