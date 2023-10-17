const ModalFeatureContactComponent = () => {};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        ModalFeatureContactComponent,
    ],
    templateUrl: () => 'assets/tpl/modals/modal-feature-contact.html',
};
