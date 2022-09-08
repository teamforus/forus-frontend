const ModalVoucherTransactionProviderComponent = function (
    FundService,
    VoucherService,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.submitButtonDisabled = true;

    $ctrl.targets = [
        { key: 'provider', name: 'Provider' },
    ];

    $ctrl.fetchVoucherFund = (voucher) => {
        return FundService.read(voucher.fund.organization_id, voucher.fund_id).then((res) => res.data.data);
    };

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

    $ctrl.onFormChange = () => {
        const { target, provider_id, target_iban, amount } = $ctrl.form.values;

        if (target === 'provider') {
            return $ctrl.submitButtonDisabled = !provider_id || !amount;
        }

        if (target === 'identity') {
            return $ctrl.submitButtonDisabled = !target_iban || !amount;
        }

        return $ctrl.submitButtonDisabled = true;
    };

    $ctrl.buildForm = () => {
        return FormBuilderService.build({
            note: '',
            amount: '',
            target: $ctrl.targets[0]?.key,
            voucher_id: $ctrl.voucher.id,
            provider_id: $ctrl.providers[0]?.id,
        }, (form) => {
            if (form.values.target === 'provider') {
                delete form.values.target_iban;
            } else if (form.values.target === 'identity') {
                delete form.values.provider_id;
            }

            VoucherService.makeSponsorTransaction($ctrl.organization.id, form.values).then((res) => {
                $ctrl.state = 'finish';
                $ctrl.transaction = res.data;
            }, (res) => {
                form.errors = res.data.errors;
                $ctrl.state = 'form';
                PushNotificationsService.danger('Mislukt!', res.data.message);
            }).finally(() => form.unlock());
        }, true)
    }

    $ctrl.closeModal = () => {
        if ($ctrl.transaction && typeof $ctrl.onCreated == 'function') {
            $ctrl.onCreated();
        }

        $ctrl.close();
    };

    $ctrl.$onInit = () => {
        const { voucher, organization, onCreated } = $ctrl.modal.scope;

        $ctrl.state = 'form';
        $ctrl.voucher = voucher;
        $ctrl.onCreated = onCreated;
        $ctrl.organization = organization;

        $ctrl.fetchVoucherFund(voucher).then((fund) => {
            $ctrl.fund = fund;

            if ($ctrl.fund.allow_direct_payments) {
                $ctrl.targets.push({ key: 'identity', name: 'Identity' },);
            }

            $ctrl.fetchProviders(voucher, organization).then((data) => {
                $ctrl.providers = data;
                $ctrl.providersList = data.reduce((list, item) => ({ ...list, [item.id]: item }), {});
                $ctrl.form = $ctrl.buildForm();

                $ctrl.onFormChange();
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FundService',
        'VoucherService',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ModalVoucherTransactionProviderComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-voucher-transaction-provider.html',
};
