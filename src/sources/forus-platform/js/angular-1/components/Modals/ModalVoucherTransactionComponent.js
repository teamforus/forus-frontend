const ModalVoucherTransactionComponent = function (
    $q,
    $filter,
    FundService,
    VoucherService,
    PermissionsService,
    FormBuilderService,
    OrganizationService,
    ReimbursementService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const transLabelPrefix = 'modals.modal_voucher_transaction.labels';

    $ctrl.submitButtonDisabled = true;
    $ctrl.canUseReimbursements = false;

    $ctrl.targets = [{
        key: 'provider',
        name: $translate(`${transLabelPrefix}.target_provider_option`),
    }];

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
        const { target, organization_id, target_iban, target_name } = $ctrl.form.values;
        const { amount, iban_source } = $ctrl.form.values;
        const { reimbursement } = $ctrl.form;

        if (target === 'provider') {
            return $ctrl.submitButtonDisabled = !organization_id || !amount;
        }

        if (target === 'top_up') {
            return $ctrl.submitButtonDisabled = !amount;
        }

        if (target === 'iban') {
            return $ctrl.submitButtonDisabled = iban_source === 'manual' ?
                (!target_iban || !target_name || !amount) :
                (!reimbursement?.id || !amount);
        }

        return $ctrl.submitButtonDisabled = true;
    };

    $ctrl.buildForm = () => {
        return FormBuilderService.build({
            note: '',
            note_shared: false,
            amount: '',
            target: $ctrl.target,
            voucher_id: $ctrl.voucher.id,
            organization_id: $ctrl.providers[0]?.id,
            iban_source: 'manual',
            reimbursement_id: null,
        }, (form) => {
            const values = (
                ({ note, note_shared, amount, target, voucher_id }) => ({ note, note_shared, amount, target, voucher_id })
            )(form.values);

            if (form.values.target === 'provider') {
                values.organization_id = form.values.organization_id;
            } else if (form.values.target === 'iban') {
                const { iban_source, target_iban, target_name } = form.values;
                const target_reimbursement_id = form.reimbursement?.id || null;

                if (iban_source == 'manual') {
                    values.target_iban = target_iban;
                    values.target_name = target_name;
                }

                if (iban_source == 'reimbursement') {
                    values.target_reimbursement_id = target_reimbursement_id;
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
        return ReimbursementService.index($ctrl.organization.id, {
            fund_id: $ctrl.voucher.fund_id,
            identity_address: $ctrl.voucher.identity_address,
            state: 'approved',
            per_page: 100,
        }).then((res) => {
            return res.data.data.map((item) => ({ ...item, name: `NR: ${item.code} IBAN: ${item.iban}` }));
        });
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

            $ctrl.canUseReimbursements =
                $ctrl.fund.allow_reimbursements &&
                $ctrl.fund.allow_direct_payments &&
                PermissionsService.hasPermission($ctrl.organization, 'manage_reimbursements');

            if ($ctrl.fund.allow_direct_payments) {
                $ctrl.targets.push({ key: 'iban', name: $translate(`${transLabelPrefix}.target_iban_option`) },);
            }

            if (target === 'top_up') {
                $ctrl.form = $ctrl.buildForm();
                $ctrl.onFormChange();
            } else {
                const promises = [];

                promises.push($ctrl.fetchProviders(voucher, organization).then((data) => {
                    $ctrl.providers = data;
                    $ctrl.providersList = data.reduce((list, item) => ({ ...list, [item.id]: item }), {});
                }));

                promises.push($ctrl.canUseReimbursements ? $ctrl.getReimbursements().then((data) => {
                    $ctrl.reimbursements = data;
                }) : null);

                $q.all(promises).then(() => {
                    $ctrl.ibanSources = [{ key: 'manual', name: $translate(`${transLabelPrefix}.manual_source`) }];

                    if ($ctrl.reimbursements?.length > 0) {
                        $ctrl.ibanSources.push({ key: 'reimbursement', name: $translate(`${transLabelPrefix}.reimbursement_source`) });
                    }

                    $ctrl.form = $ctrl.buildForm();
                    $ctrl.onFormChange();;
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
        '$q',
        '$filter',
        'FundService',
        'VoucherService',
        'PermissionsService',
        'FormBuilderService',
        'OrganizationService',
        'ReimbursementService',
        'PushNotificationsService',
        ModalVoucherTransactionComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-voucher-transaction.html',
};
