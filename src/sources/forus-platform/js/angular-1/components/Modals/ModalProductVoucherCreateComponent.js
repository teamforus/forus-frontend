let ModalProductVoucherCreateComponent = function(
    FormBuilderService,
    ProductService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.voucherType = null;
    $ctrl.state = '';
    $ctrl.activationCodeSubmitted = false;
    $ctrl.assignTypes = [{
        key: null,
        label: 'Niet toekennen',
    }, {
        key: 'email',
        label: 'E-mailadres',
    }, {
        key: 'bsn',
        label: 'BSN',
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

        if (assignType.key) {
            delete $ctrl.form.values.activation_code;
        }

        if (assignType.key === 'bsn') {
            delete $ctrl.form.values.active;
        }
    };

    $ctrl.submitActivationCode = (activation_code) => {
        let code = activation_code ? activation_code : '';

        if ($ctrl.activationCodeSubmitted) {
            return false;
        }

        $ctrl.activationCodeSubmitted = true;
        code = code.substring(0, 4) + '-' + code.substring(4);

        // activation_code;
        VoucherService.storeValidate($ctrl.organization.id, {
            activation_code: code,
            fund_id: $ctrl.fund.id,
        }).then(() => { }, res => {
            if (res.data.errors.activation_code) {
                $ctrl.state = 'activation_code_invalid';
            } else {
                if ($ctrl.voucherType == 'activation_code') {
                    $ctrl.form.values.activation_code = code;
                }

                $ctrl.state = 'voucher_form';
            }
        });
    };

    $ctrl.productChanged = (product_id) => {
        $ctrl.product = $ctrl.products.filter(
            product => product.id == product_id
        )[0] || null;

        $ctrl.form.values.product_id = product_id;
    };

    $ctrl.submitVoucherType = () => {
        if ($ctrl.voucherType === 'activation_code') {
            $ctrl.state = 'activation_code';
        } else if ($ctrl.voucherType === 'giftcard') {
            $ctrl.state = 'voucher_form';
        }
    };

    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            expire_at: $ctrl.fund.end_date,
            product_id: $ctrl.product.id,
            fund_id: $ctrl.fund.id,
        }, (form) => {
            form.lock();
            form.values.assign_by_type = $ctrl.assignType.key;

            VoucherService.store($ctrl.organization.id, {
                ...form.values,
                ...({
                    email: { activate: 1, make_activation_code: 0 },
                    bsn: { activate: 1, make_activation_code: 0 },
                    null: { activate: 0, make_activation_code: 1 },
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
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;
        $ctrl.fund = $ctrl.modal.scope.fund || null;

        ProductService.listAll({
            fund_id: $ctrl.fund.id,
            no_price: 0,
            show_all: 1,
        }).then((res) => {
            $ctrl.products = res.data.data.map(product => {
                return {
                    id: product.id,
                    price: product.price,
                    name: product.name + ' - €' + product.price + ' (' + product.organization.name + ')',
                }
            });

            if ($ctrl.products.length > 0) {
                $ctrl.product = $ctrl.products[0];
                $ctrl.state = 'select_type';
            } else {
                return $ctrl.state = 'no_products';
            }

            $ctrl.initForm();
        });
    };

    $ctrl.$onDestroy = function() { };
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
        ModalProductVoucherCreateComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-product-voucher-create.html';
    }
};