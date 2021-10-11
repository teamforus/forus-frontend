const ModalMailPreviewComponent = function($sce) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { title, content_html } = $ctrl.modal.scope;

        $ctrl.title = title;
        $ctrl.content_html = $sce.trustAsHtml(content_html);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$sce',
        ModalMailPreviewComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-mail-preview.html';
    }
};