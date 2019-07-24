let ModalVoucherCreateComponent = function(
    FormBuilderService,
    VoucherService
) {
    let $ctrl = this;

    $ctrl.fundChanged = (fund_id) => {
        $ctrl.fund = $ctrl.funds.filter(fund => fund.id == fund_id)[0] || null;
        $ctrl.form.values.fund_id = fund_id;

        if ($ctrl.fund) {
            $ctrl.form.values.expire_at = $ctrl.fund.end_date;
        }
    };

    $ctrl.$onInit = () => {
        $ctrl.funds = $ctrl.modal.scope.funds;
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.fund = $ctrl.funds[0] || null;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;

        $ctrl.form = FormBuilderService.build({}, (form) => {
            form.lock();

            VoucherService.store(
                $ctrl.organization.id,
                form.values
            ).then(res => {
                $ctrl.onCreated(res.data.data);
                $ctrl.close();
            }, res => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });

        $ctrl.fundChanged($ctrl.fund ? $ctrl.fund.id : null);
    };

    $ctrl.$onDestroy = function() {};
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
        return '/assets/tpl/modals/modal-voucher-create.html';
    }
};