const ReimbursementEditComponent = function (
    $state,
    $filter,
    $rootScope, 
    ModalService,
    VoucherService,
    FormBuilderService,
    ReimbursementService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $i18n = $filter('i18n');

    $ctrl.reimbursementToFormValues = (reimbursement = {}) => {
        const { title, description } = reimbursement;
        const { amount, email, iban, iban_name } = reimbursement;

        return {
            ...{ title, description, email, iban, iban_name },
            amount: amount ? parseFloat(amount) : null,
            voucher_id: reimbursement?.voucher_id || $state.$params?.voucher_id || $ctrl.vouchers[0]?.id,
        };
    };

    $ctrl.setFilesErrors = (files, errors) => {
        const filesList = [...files].map((file) => ({ ...file }));
        const filesKeys = Object.keys(errors).filter((key) => key.startsWith('files.'));

        filesKeys.forEach((value, index) => {
            filesList[index].error = errors[`files.${index}`] || value;
        }, [...Array(filesList.length).keys()].map(() => null));

        return filesList;
    }

    $ctrl.makeForm = function () {
        const { reimbursement = null } = $ctrl;
        const data = $ctrl.reimbursementToFormValues(reimbursement || {});

        return FormBuilderService.build(data, (form) => {
            const values = {
                ...form.values,
                state: $ctrl.submitToReview ? 'pending' : 'draft',
                files: $ctrl.files.map((file) => file.file_data.uid),
            };

            if (typeof (values.iban) === 'string') {
                values.iban = values.iban.replace(/\s/g, '');
            }

            const promise = !reimbursement ?
                ReimbursementService.store(values) :
                ReimbursementService.update(reimbursement.id, values);

            promise.then((res) => {
                form.errors = null;

                if (res.data.data.state === 'pending') {
                    // Submitted for review
                    PushNotificationsService.success('Gelukt!', 'Declaratie verzoek is ingediend voor beoordeling.');
                } else {
                    // Saved as draft
                    PushNotificationsService.success('Gelukt!', 'Declaratie verzoek is opgeslagen.');
                }

                $state.go('reimbursements');
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors || {};
                $ctrl.files = $ctrl.setFilesErrors($ctrl.files, form.errors);
                PushNotificationsService.danger('Error!', res.data.message);
            });
        }, true);
    }

    $ctrl.updateSelectedVoucher = () => {
        $ctrl.selectedVoucher = $ctrl.vouchers.find((voucher) => voucher.id == $ctrl.form.values.voucher_id);
    }

    $ctrl.submitAvailable = () => {
        return [
            $ctrl.form?.locked,
            !$ctrl.form?.values?.amount,
            !$ctrl.form?.values?.title,
            !$ctrl.form?.values?.iban,
            !$ctrl.form?.values?.iban_name,
            !$ctrl.files.filter((file) => file?.file_data?.uid)?.length,
        ].filter((invalid) => invalid).length > 0
    }

    $ctrl.submit = function (submitToReview = false) {
        $ctrl.submitToReview = submitToReview;

        if (!$ctrl.submitToReview) {
            return $ctrl.form.submit();
        }

        ModalService.open('modalReimbursementConfirm', {
            reimbursement: {
                ...$ctrl.form.values,
                files: $ctrl.files.map((file) => file.file_data),
                fund: $ctrl.vouchers.find((voucher) => voucher.id == $ctrl.form.values.voucher_id)?.fund,
            },
            onConfirm: () => $ctrl.form.submit(),
        });
    }

    $ctrl.$onInit = () => {
        $ctrl.form = $ctrl.makeForm($ctrl.reimbursement);
        $ctrl.files = $ctrl.reimbursement?.files || [];
        $ctrl.fileUploaderAccept = ['.pdf', '.png', '.jpg', '.jpeg'];
        $ctrl.vouchers = $ctrl.vouchers.map((voucher) => VoucherService.composeCardData(voucher));
        $ctrl.updateSelectedVoucher();

        $rootScope.pageTitle = $i18n('page_state_titles.reimbursement-edit', {
            code: '#' + $ctrl.reimbursement?.code,
        });
    };
};

module.exports = {
    bindings: {
        voucher: '<',
        vouchers: '<',
        identity: '<',
        reimbursement: '<',
    },
    controller: [
        '$state',
        '$filter',
        '$rootScope',
        'ModalService',
        'VoucherService',
        'FormBuilderService',
        'ReimbursementService',
        'PushNotificationsService',
        ReimbursementEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/reimbursements-edit.html',
};