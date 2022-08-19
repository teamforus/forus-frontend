const ModalVoucherTransactionProviderComponent = function(
    $scope,
    VoucherService,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.submitButtonDisabled = true;
    $ctrl.targets = [
        {key: 'provider', name: 'Provider'},
        {key: 'identity', name: 'Identity'},
    ];

    $ctrl.fetchProviders = (voucher, organization) => {
        return OrganizationService.providerOrganizations(organization.id, {
            state: 'accepted',
            fund_id: voucher.fund_id,
            allow_budget: 1,
            per_page: 1000,
        }).then((res) => {
            return res.data.data.length != 1 ? [{
                id: null,
                name: "Selecteer aanbieder",
            }, ...res.data.data] : res.data.data;
        });
    };

    function watchValues() {
        $scope.$watch('$ctrl.form.values', function (newVal) {
            $ctrl.submitButtonDisabled = ($ctrl.form.values.target === 'provider' && !$ctrl.form.values.provider_id) ||
                ($ctrl.form.values.target === 'identity' && (
                        !$ctrl.form.values.target_iban || $ctrl.form.values.target_iban === '')
                ) || !$ctrl.form.values.amount;
        }, true);
    }

    $ctrl.$onInit = () => {
        const { voucher, organization, fund, onCreated } = $ctrl.modal.scope;

        $ctrl.state = 'form';
        $ctrl.voucher = voucher;
        $ctrl.onCreated = onCreated;
        $ctrl.organization = organization;
        $ctrl.fund = fund;

        $ctrl.fetchProviders(voucher, organization).then((data) => {
            $ctrl.providers = data;
            $ctrl.providersList = data.reduce((list, item) => ({ ...list, [item.id]: item }), {});

            $ctrl.form = FormBuilderService.build({
                note: '',
                amount: '',
                voucher_id: voucher.id,
                provider_id: data[0]?.id,
                target: 'provider'
            }, (form) => {
                if (form.values.target === 'provider') {
                    delete form.values.target_iban;
                } else if (form.values.target === 'identity') {
                    delete form.values.provider_id;
                }

                VoucherService.makeSponsorTransaction(organization.id, form.values).then((res) => {
                    $ctrl.state = 'finish';
                    $ctrl.transaction = res.data;
                }, (res) => {
                    form.errors = res.data.errors;
                    $ctrl.state = 'form';
                    PushNotificationsService.danger('Mislukt!', res.data.message);
                }).finally(() => form.unlock());
            }, true);

            watchValues();
        });
    };

    $ctrl.onClose = () => {
        if ($ctrl.transaction && typeof $ctrl.onCreated == 'function') {
            $ctrl.onCreated();
        }

        $ctrl.close();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$scope',
        'VoucherService',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ModalVoucherTransactionProviderComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-voucher-transaction-provider.html',
};
