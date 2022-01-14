let ModalPdfPreviewComponent = function() {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.rawPdfFile = $ctrl.modal.scope.rawPdfFile;
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        ModalPdfPreviewComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/file-previews/modal-pdf-preview.html';
    }
};