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
        { key: 'provider', name: 'Aanbieder' },
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
        const { target, organization_id, target_iban, target_name, amount } = $ctrl.form.values;

        if (target === 'provider') {
            return $ctrl.submitButtonDisabled = !organization_id || !amount;
        }

        if (target === 'top_up') {
            return $ctrl.submitButtonDisabled = !amount;
        }

        if (target === 'iban') {
            return $ctrl.submitButtonDisabled = !target_iban || !target_name || !amount;
        }

        return $ctrl.submitButtonDisabled = true;
    };

    $ctrl.buildForm = () => {
        return FormBuilderService.build({
            note: '',
            amount: '',
            target: $ctrl.target,
            voucher_id: $ctrl.voucher.id,
            organization_id: $ctrl.providers[0]?.id,
        }, (form) => {
            if (['top_up', 'provider'].includes(form.values.target)) {
                delete form.values.target_iban;
            }

            if (['top_up', 'iban'].includes(form.values.target)) {
                delete form.values.organization_id;
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

    $ctrl.calcTopUpLimit = (target, fund, voucher) => {
        if (target === 'top_up') {
            return Math.min(
                fund.limit_voucher_top_up_amount,
                fund.limit_voucher_total_amount - voucher.amount_total,
            );
        }

        return $ctrl.voucher.amount_available;
    };

    $ctrl.$onInit = () => {
        const { voucher, organization, onCreated, target } = $ctrl.modal.scope;

        $ctrl.state = 'form';
        $ctrl.voucher = voucher;
        $ctrl.onCreated = onCreated;
        $ctrl.organization = organization;
        $ctrl.target = target || $ctrl.targets[0]?.key;
        $ctrl.providers = [];

        $ctrl.fetchVoucherFund(voucher).then((fund) => {
            $ctrl.fund = fund;
            $ctrl.amount_limit = $ctrl.calcTopUpLimit($ctrl.target, $ctrl.fund, voucher);

            if ($ctrl.fund.allow_direct_payments) {
                $ctrl.targets.push({ key: 'iban', name: 'Bankrekening' },);
            }

            if (target === 'top_up') {
                $ctrl.form = $ctrl.buildForm();
                $ctrl.onFormChange();
            } else {
                $ctrl.fetchProviders(voucher, organization).then((data) => {
                    $ctrl.providers = data;
                    $ctrl.providersList = data.reduce((list, item) => ({ ...list, [item.id]: item }), {});
                    $ctrl.form = $ctrl.buildForm();

                    $ctrl.onFormChange();
                });
            }
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
    templateUrl: 'assets/tpl/modals/modal-voucher-transaction.html',
};
