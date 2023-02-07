const ModalProductVoucherCreateComponent = function(
    FormBuilderService,
    ProductService,
    VoucherService,
    ModalService
) {
    const $ctrl = this;

    $ctrl.assignTypes = [{
        key: 'activation_code',
        label: 'Activatiecode',
        inputLabel: 'Uniek nummer',
        hasInput: false,
    }, {
        key: 'email',
        label: 'E-mailadres',
        inputLabel: 'E-mailadres',
        hasInput: true,
    }];

    $ctrl.assignType = $ctrl.assignTypes[0];
    $ctrl.dateMinLimit = new Date();
    $ctrl.lastReplaceConfirmed = null;
    $ctrl.activationCodeSubmitted = false;

    $ctrl.onAssignTypeChange = (assignType) => {
        if (assignType !== 'bsn') {
            delete $ctrl.form.values.bsn;
        }

        if (assignType !== 'email') {
            delete $ctrl.form.values.email;
        }
    };

    $ctrl.confirmEmailSkip = function(existingEmails, onConfirm = () => { }, onCancel = () => { }) {
        let items = existingEmails.map(email => ({ value: email }));

        ModalService.open('duplicatesPicker', {
            hero_title: "Dubbele e-mailadressen gedetecteerd.",
            hero_subtitle: [
                `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een aanbiedingsvoucher wilt aanmaken?`,
                "Deze e-mailadressen bezitten al een aanbiedingsvoucher van dit fonds."
            ],
            label_on: "Aanmaken voucher",
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
                `Weet u zeker dat u voor ${items.length} bsn(s) een aanbiedingsvoucher wilt aanmaken?`,
                "Deze bsn(s) bezitten al een aanbiedingsvoucher van dit fonds."
            ],
            label_on: "Aanmaken",
            label_off: "Overslaan",
            items: items,
            onConfirm: onConfirm,
            onCancel: onCancel,
        });
    };

    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            expire_at: $ctrl.fund.end_date,
            product_id: $ctrl.product?.id,
            fund_id: $ctrl.fund.id,
        }, (form) => {
            const values = {
                ...form.values,
                ...({
                    email: { activate: 1, activation_code: 0 },
                    bsn: { activate: 1, activation_code: 0 },
                    activation_code: { activate: 0, activation_code: 1 },
                }[$ctrl.assignType.key]),
                assign_by_type: $ctrl.assignType.key,
            };

            const makRequest = (form) => {
                VoucherService.store($ctrl.organization.id, values).then(() => {
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

            VoucherService.storeValidate($ctrl.organization.id, values).then(() => {
                if ($ctrl.assignType.key === 'email' && (form.values.email !== $ctrl.lastReplaceConfirmed)) {
                    return VoucherService.index($ctrl.organization.id, {
                        type: 'product_voucher',
                        email: form.values.email,
                        fund_id: $ctrl.fund.id,
                        source: 'all',
                    }).then((res) => {
                        $ctrl.close();

                        if (res.data.meta.total > 0) {
                            return $ctrl.confirmEmailSkip([form.values.email], (emails) => {
                                if (emails.filter(email => email.model).length > 0) {
                                    $ctrl.lastReplaceConfirmed = form.values.email;
                                    makRequest(form);
                                }
                            });
                        }

                        makRequest(form);
                    });
                }

                if ($ctrl.assignType.key === 'bsn' && (form.values.bsn !== $ctrl.lastReplaceConfirmed)) {
                    return VoucherService.index($ctrl.organization.id, {
                        type: 'product_voucher',
                        bsn: form.values.bsn,
                        fund_id: $ctrl.fund.id,
                        source: 'all',
                        expired: 0,
                    }).then((res) => {
                        $ctrl.close();

                        if (res.data.meta.total > 0) {
                            return $ctrl.confirmBsnSkip([form.values.bsn], (bsns) => {
                                if (bsns.filter(bsn => bsn.model).length > 0) {
                                    $ctrl.lastReplaceConfirmed = form.values.bsn;
                                    makRequest(form);
                                }
                            });
                        }

                        makRequest(form);
                    });
                }

                makRequest(form);
            }, res => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.$onInit = () => {
        $ctrl.modal.loaded = false;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;
        $ctrl.fund = $ctrl.modal.scope.fund || null;

        if ($ctrl.organization.bsn_enabled) {
            $ctrl.assignTypes.push({
                key: 'bsn',
                label: 'BSN',
                inputLabel: 'BSN',
                hasInput: true,
            });
        }

        ProductService.listAll({
            fund_id: $ctrl.fund.id,
            show_all: 1,
            simplified: 1,
            per_page: 1000,
            order_by: 'name',
            order_by_dir: 'asc',
        }).then((res) => {
            $ctrl.products = res.data.data.map((product) => ({
                id: product.id,
                price: product.price,
                name: product.name + ' (' + product.price_locale + ') van (' + product.organization.name + ')',
            }));

            $ctrl.modal.setLoaded();

            if ($ctrl.products.length == 0) {
                $ctrl.close();

                return ModalService.open('modalNotification', {
                    type: 'info',
                    title: 'modals.modal_product_voucher_create.errors.title.no_products',
                    description: 'modals.modal_product_voucher_create.errors.no_products',
                    closeBtnText: 'modals.modal_product_voucher_create.buttons.close',
                });
            }

            $ctrl.modal.loaded = true;
            $ctrl.initForm();
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'ProductService',
        'VoucherService',
        'ModalService',
        ModalProductVoucherCreateComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-product-voucher-create.html',
};
