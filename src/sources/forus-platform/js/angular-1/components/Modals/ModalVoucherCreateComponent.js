let ModalVoucherCreateComponent = function(
    FormBuilderService,
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

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;
        $ctrl.state = 'select_type';

        $ctrl.form = FormBuilderService.build({
            fund_id: $ctrl.fund.id,
            expire_at: $ctrl.fund.end_date,
        }, (form) => {
            form.lock();

            VoucherService.store($ctrl.organization.id, {
                ...form.values,
                ...{
                    activate: form.values.disable ? 0 : 1,
                    make_activation_code: form.values.make_activation_code ? 1 : 0,
                }
            }).then(() => {
                $ctrl.onCreated();
                $ctrl.close();
            }, res => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };

    $ctrl.submitVoucherType = () => {
        if ($ctrl.voucherType === 'activation_code') {
            $ctrl.state = 'activation_code';
        } else if ($ctrl.voucherType === 'giftcard') {
            $ctrl.state = 'voucher_form';
        }
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
        'VoucherService',
        ModalVoucherCreateComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-create.html';
    }
};