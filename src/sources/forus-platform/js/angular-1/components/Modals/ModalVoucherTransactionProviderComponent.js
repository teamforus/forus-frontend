const ModalVoucherTransactionProviderComponent = function(
    FormBuilderService,
    VoucherService,
    OrganizationService
) {
    const $ctrl = this;
    $ctrl.previewForm = false;
    $ctrl.finishForm = false;

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.voucher = $ctrl.modal.scope.voucher;

        OrganizationService.providerOrganizations($ctrl.organization.id, {}).then((res => {
            $ctrl.providerOrganizations = res.data.data;

            $ctrl.providerOrganizations.unshift({
                id: null,
                name: "Selecteer aanbieder"
            });
        }));

        $ctrl.form = FormBuilderService.build({
            provider_id: null,
            amount: 0,
        }, (form) => {
            VoucherService.makeTransaction($ctrl.organization.id, $ctrl.voucher.id, form.values).then(() => {
                $ctrl.previewForm = false;
                $ctrl.finishForm = true;
            }, res => {
                $ctrl.previewForm = false;
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.showPreviewForm = () => {
        $ctrl.selectedProvider = $ctrl.providerOrganizations.filter((provider) => provider.id === $ctrl.form.values.provider_id)[0];

        if (!$ctrl.selectedProvider.id) {
            $ctrl.form.errors = {provider_id: ['Selecteer aanbieder']};
            return;
        }

        $ctrl.form.errors = {};
        $ctrl.previewForm = true;
    };

    $ctrl.confirm = () => {
        $ctrl.close();
        typeof $ctrl.onConfirm === 'function' && $ctrl.onConfirm();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'VoucherService',
        'OrganizationService',
        ModalVoucherTransactionProviderComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-transaction-provider.html';
    }
};
