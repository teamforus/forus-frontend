let ModalPhysicalCardOrderComponent = function(
    FormBuilderService,
    PhysicalCardsRequestService,
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.voucher = $ctrl.modal.scope.voucher;
        $ctrl.state = $ctrl.modal.scope.state || 'fill_data';

        $ctrl.requestPhysicalCardForm = FormBuilderService.build({}, (form) => {
            PhysicalCardsRequestService.store(
                $ctrl.modal.scope.voucher.address,
                form.values
            ).then(() => $ctrl.state = 'success_new_card', (res) => {
                $ctrl.requestPhysicalCardForm.unlock();
                $ctrl.requestPhysicalCardForm.errors = res.data.errors;
                $ctrl.state = 'success_new_card';
                
                if (res.status === 429) {
                    return $ctrl.requestPhysicalCardForm.errors = {
                        to_many_requests: [res.data.message]
                    };
                }
            });
        });
    };

    $ctrl.requestCard = () => {
        PhysicalCardsRequestService.validate(
            $ctrl.modal.scope.voucher.address,
            $ctrl.requestPhysicalCardForm.values
        ).then(() => {
            $ctrl.requestPhysicalCardForm.errors = {};
            $ctrl.state = 'confirm_new_card';
            $ctrl.requestPhysicalCardForm.addressPreview = [[
                $ctrl.requestPhysicalCardForm.values.address,
                $ctrl.requestPhysicalCardForm.values.house,
                $ctrl.requestPhysicalCardForm.values.house_addition
            ].filter((value) => value).join(' '), [
                $ctrl.requestPhysicalCardForm.values.postcode,
                $ctrl.requestPhysicalCardForm.values.city,
            ].filter((value) => value).join(' ')];
        }, (res) => {
            $ctrl.requestPhysicalCardForm.unlock();
            $ctrl.requestPhysicalCardForm.errors = res.data.errors;
        });
    };

    $ctrl.confirmCard = () => {
        $ctrl.requestPhysicalCardForm.submit();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        voucher: '<',
    },
    controller: [
        'FormBuilderService',
        'PhysicalCardsRequestService',
        ModalPhysicalCardOrderComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-physical-card-order.html';
    }
};