const ModalVoucherQrCodeComponent = function(
    PushNotificationsService,
    FormBuilderService,
    PrintableService,
    VoucherService
) {
    const $ctrl = this;

    $ctrl.assigning = $ctrl.assigning || false;
    $ctrl.success = false;

    $ctrl.assignTypes = [{
        key: 'email',
        label: 'E-mailadres',
    }];

    $ctrl.assignType = $ctrl.assignTypes[0];

    $ctrl.onAssignTypeChange = (assignType) => {
        if (assignType.key !== 'bsn') {
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
        if ($ctrl.assignType.key === 'email' || $ctrl.assignType.key === 'bsn') {
            return VoucherService.assign($ctrl.organization.id, $ctrl.voucher.id, query);
        } else if ($ctrl.assignType.key === 'activate') {
            return VoucherService.activate($ctrl.organization.id, $ctrl.voucher.id);
        } else if ($ctrl.assignType.key === 'activation_code') {
            return VoucherService.makeActivationCode($ctrl.organization.id, $ctrl.voucher.id);
        }
    };

    $ctrl.printQrCode = () => {
        PrintableService.open('voucherQrCode', {
            voucher: $ctrl.voucher,
            fund: $ctrl.voucher.fund,
            organization: $ctrl.organization,
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onSent = $ctrl.modal.scope.onSent;
        $ctrl.onAssigned = $ctrl.modal.scope.onAssigned;
        $ctrl.voucherActive = $ctrl.voucher.state === 'active';
        $ctrl.assigning = !$ctrl.voucherActive;
        $ctrl.qrCodeValue = $ctrl.voucher.address;

        if ($ctrl.organization.bsn_enabled) {
            $ctrl.assignTypes.push({
                key: 'bsn',
                label: 'BSN'
            });
        }

        if (!$ctrl.voucherActive && !$ctrl.voucher.activation_code) {
            $ctrl.assignTypes.unshift({ key: 'activation_code', label: 'Create an activation code' });
        }

        if (!$ctrl.voucherActive) {
            $ctrl.assignTypes.unshift({ key: 'activate', label: 'Activeren' });
        }

        $ctrl.assignType = $ctrl.assignTypes[0];

        $ctrl.form = FormBuilderService.build({}, (form) => {
            form.lock();

            const promise = $ctrl.assigning ? $ctrl.assignToIdentity(
                form.values
            ) : $ctrl.sendToEmail(form.values.email);

            promise.then((res) => {
                $ctrl.onSent(res.data.data);
                $ctrl.onAssigned(res.data.data);
                $ctrl.success = true;
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
                PushNotificationsService.danger('Error!', res.data.message);
            });
        });
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'PushNotificationsService',
        'FormBuilderService',
        'PrintableService',
        'VoucherService',
        ModalVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-voucher-qr_code.html';
    }
};