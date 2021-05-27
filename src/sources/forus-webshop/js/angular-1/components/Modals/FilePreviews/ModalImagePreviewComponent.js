const ModalImagePreviewComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.imageSrc = $ctrl.modal.scope.imageSrc;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        ModalImagePreviewComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/file-previews/modal-image-preview.html';
    }
};