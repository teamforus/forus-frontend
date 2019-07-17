let ModalVoucherQrCodeComponent = function(
    $element,
    FormBuilderService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.assigning = false;
    $ctrl.success = false;

    $ctrl.goAssigning = () => {
        $ctrl.assigning = true;
        $ctrl.form.values.email = '';
        $ctrl.form.resetErrors();
    };
    
    $ctrl.goSending = () => {
        $ctrl.assigning = false;
        $ctrl.form.values.email = '';
        $ctrl.form.resetErrors();
    };

    $ctrl.sendToEmail = (email) => {
        return VoucherService.sendToEmail(
            $ctrl.organziation.id,
            $ctrl.voucher.id,
            email
        );
    };

    $ctrl.assignToIdentity = (email) => {
        return VoucherService.assign(
            $ctrl.organziation.id,
            $ctrl.voucher.id,
            email
        );
    };

    $ctrl.printQrCode = () => {
        let body = angular.element('body');
        let bodyElements = angular.element('body>*');
        let printContents = $element.find('.qr_code').first().clone();

        printContents.addClass('printable-qr_code');
        bodyElements.css('display', 'none');
        body.append(printContents);
        window.print();
        bodyElements.css('display', '');
        printContents.remove();
    }

    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.organziation = $ctrl.modal.scope.organization;
        $ctrl.onSent = $ctrl.modal.scope.onSent;
        $ctrl.onAssigned = $ctrl.modal.scope.onAssigned;

        let qrCodeEl = $element.find('.qr_code')[0];
        let qrCode = new QRCode(qrCodeEl, {
            colorLight: 'transparent', 
            correctLevel: QRCode.CorrectLevel.L
        });

        qrCode.makeCode(
            JSON.stringify({
                type: 'voucher',
                value: $ctrl.voucher.address
            })
        );

        qrCodeEl.removeAttribute('title');

        $ctrl.form = FormBuilderService.build({}, (form) => {
            form.lock();

            let promise = $ctrl.assigning ? $ctrl.assignToIdentity(
                form.values.email
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

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$element',
        'FormBuilderService',
        'VoucherService',
        ModalVoucherQrCodeComponent
    ],
    templateUrl: () => {
        return '/assets/tpl/modals/modal-voucher-qr_code.html';
    }
};