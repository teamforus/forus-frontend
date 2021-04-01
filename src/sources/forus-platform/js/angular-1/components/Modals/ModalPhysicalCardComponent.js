let ModalPhysicalCardComponent = function(FormBuilderService, PhysicalCardsService) {
    let $ctrl = this;
    
    $ctrl.voucher = null;
    $ctrl.state = '';
    
    $ctrl.$onInit = () => {
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onAttached = $ctrl.modal.scope.onAttached;

        $ctrl.activateCodeForm = FormBuilderService.build({
            code: '1001'
        }, (form) => {
            PhysicalCardsService.store(
                $ctrl.organization.id, 
                $ctrl.voucher.id, 
                form.values
            ).then(res => {
                $ctrl.code = res.data.data.code
                $ctrl.state = 'success_old_card';
                $ctrl.onAttached();
            }, (res) => {
                form.unlock();

                if (res.status === 429) {
                    return form.errors = {
                        code: [res.data.message]
                    };
                }

                form.errors = res.data.errors;
            });
        });
    };

    $ctrl.submitActivationCode = () => {
        $ctrl.activateCodeForm.submit();
    };    
    
    $ctrl.resetPinCode = () => {
        $ctrl.activateCodeForm.values.code = "1001";
    };    
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        'PhysicalCardsService',
        ModalPhysicalCardComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-physical-card.html';
    }
};