const ModalPhysicalCardOrderComponent = function(
    FormBuilderService,
    PhysicalCardsRequestService,
) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.state = $ctrl.modal.scope.state || 'form';
        $ctrl.voucher = $ctrl.modal.scope.voucher;

        $ctrl.form = FormBuilderService.build({}, (form) => {
            PhysicalCardsRequestService.store(
                $ctrl.voucher.fund.organization_id,
                $ctrl.voucher.address,
                form.values
            ).then(() => {
                $ctrl.form.resetErrors();
                $ctrl.state = 'success';
            }, (res) => {
                form.unlock();
                form.errors = res.data.errors;
                $ctrl.state = 'form';
            });
        }, true);
    };

    $ctrl.requestCard = () => {
        PhysicalCardsRequestService.validate(
            $ctrl.voucher.fund.organization_id,
            $ctrl.voucher.address,
            $ctrl.form.values
        ).then(() => {
            const { address, house, house_addition, postcode, city } = $ctrl.form.values;

            $ctrl.form.resetErrors();
            $ctrl.state = 'confirmation';

            $ctrl.form.addressPreview = [
                [address, house, house_addition].filter((value) => value).join(' '),
                [postcode, city].filter((value) => value).join(' '),
            ];
        }, (res) => {
            $ctrl.form.errors = res.data.errors;
        });
    };

    $ctrl.confirmCard = () => {
        $ctrl.form.submit();
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