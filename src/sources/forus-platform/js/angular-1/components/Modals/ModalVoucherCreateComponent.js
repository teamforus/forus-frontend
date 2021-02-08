let ModalVoucherCreateComponent = function(
    FormBuilderService,
    VoucherService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.lastReplaceConfirmed = null;
    $ctrl.voucherType = 'activation_code_uid';
    $ctrl.activationCodeSubmitted = false;
    $ctrl.assignTypes = [{
        key: 'activation_code_uid',
        label: 'Activatiecode',
        inputLabel: 'Uniek nummer',
    }, {
        key: 'email',
        label: 'E-mailadres',
        inputLabel: 'E-mailadres',
    }, {
        key: 'bsn',
        label: 'BSN',
        inputLabel: 'BSN',
    }];

    $ctrl.assignType = $ctrl.assignTypes[0];
    $ctrl.dateMinLimit = new Date();

    $ctrl.onAsignTypeChange = (assignType) => {
        if (assignType.key !== 'bsn') {
            delete $ctrl.form.values.bsn;
        }

        if (assignType.key !== 'email') {
            delete $ctrl.form.values.email;
        }

        if (assignType.key !== 'activation_code_uid') {
            delete $ctrl.form.values.activation_code_uid;
        }
    };

    $ctrl.confirmEmailSkip = function(existingEmails, onConfirm = () => { }, onCancel = () => { }) {
        let items = existingEmails.map(email => ({ value: email }));

        ModalService.open('duplicatesPicker', {
            hero_title: "Dubbele e-mailadressen gedetecteerd.",
            hero_subtitle: [
                `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een extra tegoed wilt aanmaken?`,
                "Deze e-mailadressen bezitten al een tegoed van dit fonds."
            ],
            label_on: "Aanmaken tegoed",
            label_off: "Overslaan",
            items: items,
            onConfirm: onConfirm,
            onCancel: onCancel,
        });
    };

    $ctrl.confirmBsnSkip = function(existingBsn, onConfirm = () => { }, onCancel = () => { }) {
        let items = existingBsn.map(bsn => ({ value: bsn }));

        ModalService.open('duplicatesPicker', {
            hero_title: "Dubbele bsn(s) gedetecteerd.",
            hero_subtitle: [
                `Weet u zeker dat u voor ${items.length} bsn(s) een extra tegoed wilt aanmaken?`,
                "Deze burgerservicenummers bezitten al een tegoed van dit fonds."
            ],
            label_on: "Aanmaken tegoed",
            label_off: "Overslaan",
            items: items,
            onConfirm: onConfirm,
            onCancel: onCancel,
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;

        $ctrl.form = FormBuilderService.build({
            fund_id: $ctrl.fund.id,
            expire_at: $ctrl.fund.end_date,
        }, (form) => {
            VoucherService.storeValidate($ctrl.organization.id, {
                ...form.values,
                ...{ assign_by_type: $ctrl.assignType.key },
                ...({
                    email: { activate: 1, activation_code: 0 },
                    bsn: { activate: 1, activation_code: 0 },
                    activation_code_uid: { activate: 0, activation_code: 1 },
                }[$ctrl.assignType.key])
            }).then(() => {
                if ($ctrl.assignType.key === 'email' && (form.values.email !== $ctrl.lastReplaceConfirmed)) {
                    return VoucherService.index($ctrl.organization.id, {
                        type: 'fund_voucher',
                        email: form.values.email,
                        fund_id: $ctrl.fund.id,
                        source: 'all',
                        expired: 0,
                    }).then((res) => {
                        $ctrl.close();

                        if (res.data.meta.total > 0) {
                            return $ctrl.confirmEmailSkip([form.values.email], (emails) => {
                                if (emails.filter(email => email.model).length > 0) {
                                    $ctrl.lastReplaceConfirmed = form.values.email;
                                    $ctrl.makRequest(form);
                                }
                            });
                        }

                        $ctrl.makRequest(form);
                    });
                }

                if ($ctrl.assignType.key === 'bsn' && (form.values.bsn !== $ctrl.lastReplaceConfirmed)) {
                    return VoucherService.index($ctrl.organization.id, {
                        type: 'fund_voucher',
                        bsn: form.values.bsn,
                        fund_id: $ctrl.fund.id,
                        source: 'all',
                    }).then((res) => {
                        $ctrl.close();

                        if (res.data.meta.total > 0) {
                            return $ctrl.confirmBsnSkip([form.values.bsn], (bsns) => {
                                if (bsns.filter(bsn => bsn.model).length > 0) {
                                    $ctrl.lastReplaceConfirmed = form.values.bsn;
                                    $ctrl.makRequest(form);
                                }
                            });
                        }

                        $ctrl.makRequest(form);
                    });
                }

                $ctrl.makRequest(form);
            }, res => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.makRequest = (form) => {
        VoucherService.store($ctrl.organization.id, {
            ...form.values,
            ...{ assign_by_type: $ctrl.assignType.key },
            ...({
                email: { activate: 1, activation_code: 0 },
                bsn: { activate: 1, activation_code: 0 },
                activation_code_uid: { activate: 0, activation_code: 1 },
            }[$ctrl.assignType.key])
        }).then(() => {
            $ctrl.onCreated();
            $ctrl.close();
        }, res => {
            form.errors = res.data.errors;
            form.unlock();

            if (res.data.message && res.status !== 422) {
                alert(res.data.message);
            }
        });
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'VoucherService',
        'ModalService',
        ModalVoucherCreateComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-create.html';
    }
};
