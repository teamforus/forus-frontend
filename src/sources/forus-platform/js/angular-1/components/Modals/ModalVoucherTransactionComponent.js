const ModalVoucherTransactionProviderComponent = function (
    FundService,
    VoucherService,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService,
    ReimbursementService,
    PermissionsService,
    $filter,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const transLabelPrefix = 'modals.modal_voucher_transaction.labels';

    $ctrl.submitButtonDisabled = true;
    $ctrl.canUseReimbursements = false;

    $ctrl.targets = [
        { key: 'provider', name: $translate(`${transLabelPrefix}.target_provider_option`) },
    ];

    $ctrl.fetchVoucherFund = (voucher) => {
        return FundService.read(voucher.fund.organization_id, voucher.fund_id).then((res) => res.data.data);
    };

    $ctrl.fetchProviders = (voucher, organization) => {
        return OrganizationService.providerOrganizations(organization.id, {
            state: 'accepted',
            resource_type: 'select',
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
        const {
            target, organization_id, target_iban, target_name, amount, iban_source, reimbursement_id,
        } = $ctrl.form.values;

        if (target === 'provider') {
            return $ctrl.submitButtonDisabled = !organization_id || !amount;
        }

        if (target === 'top_up') {
            return $ctrl.submitButtonDisabled = !amount;
        }

        if (target === 'iban') {
            return iban_source === 'manual'
                ? $ctrl.submitButtonDisabled = !target_iban || !target_name || !amount
                : $ctrl.submitButtonDisabled = !reimbursement_id || !amount;
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
            iban_source: 'manual',
            reimbursement_id: null,
        }, (form) => {
            let values = (
                ({ note, amount, target, voucher_id }) => ({ note, amount, target, voucher_id })
            )(form.values);

            if (form.values.target === 'provider') {
                values.organization_id = form.values.organization_id;
            } else if (form.values.target === 'iban') {
                values = {
                    ...values,
                    target_iban: form.values.target_iban,
                    target_name: form.values.target_name,
                    iban_source: form.values.iban_source,
                }

                if (form.values.iban_source === 'reimbursement') {
                    values.reimbursement_id = form.values.reimbursement_id;
                }
            }

            VoucherService.makeSponsorTransaction($ctrl.organization.id, values).then((res) => {
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

    $ctrl.getReimbursements = () => {
        $ctrl.ibanSources = [
            { key: 'manual', name: $translate(`${transLabelPrefix}.manual_source`) },
            { key: 'reimbursement', name: $translate(`${transLabelPrefix}.reimbursement_source`) },
        ];

        return ReimbursementService.index($ctrl.organization.id, {
            identity_address: $ctrl.voucher.identity_address,
            state: 'approved',
            per_page: 100,
        }).then((res) => {
            $ctrl.reimbursements = res.data.data.map((reimbursement) => {
                return { ...reimbursement, name: `NR: ${reimbursement.code} IBAN: ${reimbursement.iban}`};
            });
        });
    };

    $ctrl.onIbanSourceChange = () => {
        if ($ctrl.form.values.iban_source === 'reimbursement') {
            $ctrl.form.values.reimbursement_id = $ctrl.reimbursements[0]?.id;
            $ctrl.onReimbursementSelectChange();
        } else {
            $ctrl.form.values.target_iban = '';
            $ctrl.form.values.target_name = '';
        }

        $ctrl.onFormChange();
    };

    $ctrl.onReimbursementSelectChange = () => {
        const reimbursement = $ctrl.reimbursements.filter((item) => item.id === $ctrl.form.values.reimbursement_id)[0];

        $ctrl.form.values.target_iban = reimbursement?.iban;
        $ctrl.form.values.target_name = reimbursement?.iban_name;

        $ctrl.onFormChange();
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
            $ctrl.canUseReimbursements = PermissionsService.hasPermission($ctrl.organization, 'manage_reimbursements') &&
                $ctrl.fund.allow_reimbursements;

            if ($ctrl.fund.allow_direct_payments) {
                $ctrl.targets.push({ key: 'iban', name: $translate(`${transLabelPrefix}.target_iban_option`) },);
            }

            if (target === 'top_up') {
                $ctrl.form = $ctrl.buildForm();
                $ctrl.onFormChange();
            } else {
                $ctrl.fetchProviders(voucher, organization).then((data) => {
                    $ctrl.providers = data;
                    $ctrl.providersList = data.reduce((list, item) => ({ ...list, [item.id]: item }), {});

                    if ($ctrl.fund.allow_direct_payments && $ctrl.canUseReimbursements) {
                        $ctrl.getReimbursements().then(() => {
                            $ctrl.form = $ctrl.buildForm();
                            $ctrl.onFormChange();
                        });
                    } else {
                        $ctrl.form = $ctrl.buildForm();
                        $ctrl.onFormChange();
                    }
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
        'ReimbursementService',
        'PermissionsService',
        '$filter',
        ModalVoucherTransactionProviderComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-voucher-transaction.html',
};
