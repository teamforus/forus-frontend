let ModalVoucherQrCodeComponent = function(
    FormBuilderService,
    PrintableService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.assigning = false;
    $ctrl.success = false;

    $ctrl.assignTypes = [{
        key: 'email',
        label: 'E-mail',
    }, {
        key: 'bsn',
        label: 'BSN',
    }];

    $ctrl.assignType = $ctrl.assignTypes[0];

    $ctrl.onAsignTypeChange = (assignType) => {
        if (assignType.key === 'bsn') {
            delete $ctrl.form.values.bsn;
        }

        if (assignType.key !== 'email') {
            delete $ctrl.form.values.email;
        }
    };

    $ctrl.goAssigning = () => {
        $ctrl.assigning = true;
        delete $ctrl.form.values.email;
        delete $ctrl.form.values.bsn;
        $ctrl.form.resetErrors();
    };

    $ctrl.goSending = () => {
        $ctrl.assigning = false;
        delete $ctrl.form.values.email;
        delete $ctrl.form.values.bsn;
        $ctrl.form.resetErrors();
    };

    $ctrl.sendToEmail = (email) => {
        return VoucherService.sendToEmail(
            $ctrl.organization.id,
            $ctrl.voucher.id,
            email
        );
    };

    $ctrl.assignToIdentity = (query) => {
        return VoucherService.assign($ctrl.organization.id, $ctrl.voucher.id, query);
    };

    $ctrl.printQrCode = () => {
        PrintableService.open('voucherQrCode', {
            voucher: $ctrl.voucher,
            fund: $ctrl.fund,
            organization: $ctrl.organization,
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onSent = $ctrl.modal.scope.onSent;
        $ctrl.onAssigned = $ctrl.modal.scope.onAssigned;

        $ctrl.qrCodeValue = $ctrl.voucher.address;

        $ctrl.form = FormBuilderService.build({
            email: '',
            bsn: '',
        }, (form) => {
            form.lock();

            let promise = $ctrl.assigning ? $ctrl.assignToIdentity(
                form.values
            ) : $ctrl.sendToEmail(form.values.email);

            promise.then(res => {
                $ctrl.onSent(res.data.data);
                $ctrl.onAssigned(res.data.data);
                $ctrl.success = true;
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
        'PrintableService',
        'VoucherService',
        ModalVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-qr_code.html';
    }
};