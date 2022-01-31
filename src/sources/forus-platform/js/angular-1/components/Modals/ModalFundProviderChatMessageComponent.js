let ModalFundProviderChatMessageComponent = function(
    FormBuilderService,
    FundProviderChatService
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        let submit = $ctrl.modal.scope.submit;
        let fund_id = $ctrl.modal.scope.fund_id;
        let fund_provider_id = $ctrl.modal.scope.fund_provider_id;
        let product_id = $ctrl.modal.scope.product_id;
        let organization_id = $ctrl.modal.scope.organization_id;

        $ctrl.form = FormBuilderService.build({
            message: '',
            product_id: product_id,
        }, (form) => {
            FundProviderChatService.store(
                organization_id,
                fund_id,
                fund_provider_id, 
                form.values
            ).then(res => {
                submit(res.data.data);
                $ctrl.close();
            }, (res) => {
                form.unlock();
                if (res.status === 422) {
                    return (form.errors = res.data.errors);
                }

                $ctrl.close();
                submit(res);
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        'FormBuilderService',
        'FundProviderChatService',
        ModalFundProviderChatMessageComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-provider-chat-message.html';
    }
};