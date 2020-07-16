let ModalPhysicalCardTypeComponent = function(
    IdentityService,
    FormBuilderService,
    PrintableService,
    PhysicalCardsService,
    ModalService,
) {
    let $ctrl = this;
    
    $ctrl.voucher = null;
    $ctrl.state = '';
    $ctrl.preffersPlasticCard = false;
    
    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.voucher = $ctrl.modal.scope.voucher;

        $ctrl.state = 'select_type';
        $ctrl.physicalCardType = 'old';

        $ctrl.activateCodeForm = FormBuilderService.build({
            code: '1001'
        }, (form) => {
            PhysicalCardsService.storePhysicalCard(
                $ctrl.modal.scope.voucher.address, form.values
            ).then(res => {
                $ctrl.state = 'success_old_card';
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });

        $ctrl.requestPhysicalCardForm = FormBuilderService.build({}, (form) => {
            PhysicalCardsService.requestPhysicalCard(
                $ctrl.modal.scope.voucher.address, form.values
            ).then(res => {
                $ctrl.state = 'success_new_card';
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
            });
        });
    };

    $ctrl.choosePhysicalCardType = (type) => {
        $ctrl.physicalCardType = type;

        if (type == 'old') {
            $ctrl.state = 'card_code';
        } else {
            $ctrl.state = 'digital_pass';
        }
    };

    $ctrl.prefferPlasticCard = () => {
        $ctrl.preffersPlasticCard = true;
    };

    $ctrl.submitActivationCode = () => {
        $ctrl.activateCodeForm.submit();
    };

    $ctrl.requestCard = () => {
        $ctrl.requestPhysicalCardForm.submit();
    };

    $ctrl.emailToMe = () => {};

    $ctrl.printCard = () => {
        console.log('voucher: ', {
            voucher: $ctrl.voucher,
            fund: $ctrl.voucher.fund,
            organization: $ctrl.voucher.fund.organization,
        });
        PrintableService.open('physicalCardCode', {
            voucher: $ctrl.voucher,
            fund: $ctrl.voucher.fund,
            organization: $ctrl.voucher.fund.organization,
        });
    };

    $ctrl.openInApp = () => { ModalService.open('modalOpenInMe'); };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        voucher: '<',
    },
    controller: [
        'IdentityService',
        'FormBuilderService',
        'PrintableService',
        'PhysicalCardsService',
        'ModalService',
        ModalPhysicalCardTypeComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-physical-card-type.html';
    }
};