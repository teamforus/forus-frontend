let ModalVoucherCreateComponent = function(
    FormBuilderService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.voucherType = 'activation_code_uid';
    $ctrl.activationCodeSubmitted = false;
    $ctrl.assignTypes = [{
        key: 'activation_code_uid',
        label: 'Activatiecode',
        inputLabel: 'Uid',
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

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;

        $ctrl.form = FormBuilderService.build({
            fund_id: $ctrl.fund.id,
            expire_at: $ctrl.fund.end_date,
        }, (form) => {
            form.lock();

            VoucherService.store($ctrl.organization.id, {
                ...form.values,
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
            });
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
        'VoucherService',
        ModalVoucherCreateComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-create.html';
    }
};
