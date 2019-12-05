let ModalPdfPreviewComponent = function() {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.rawPdfFile = $ctrl.modal.scope.rawPdfFile;
    };
    $ctrl.$onDestroy = function() {};
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
        return 'assets/tpl/modals/modal-pdf-preview.html';
    }
};