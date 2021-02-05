let ModalSubsidyProductEditComponent = function(
    $timeout,
    FundService,
    FormBuilderService
) {
    let $ctrl = this;
    let timeout = null

    $ctrl.max = (a, b) => Math.max(a, b);

    $ctrl.amountChange = () => {
        $timeout.cancel(timeout);

        if (!$ctrl.form.values.amount && $ctrl.form.values.amount !== 0) {
            timeout = $timeout(() => $ctrl.form.values.amount = 0, 1000);
        }
    };

    $ctrl.$onInit = () => {
        $ctrl.fund = $ctrl.modal.scope.fund;
        $ctrl.fundProvider = $ctrl.modal.scope.fundProvider;
        $ctrl.product = $ctrl.modal.scope.product;
        $ctrl.readOnly = $ctrl.modal.scope.readOnly;
        $ctrl.readValues = $ctrl.modal.scope.readValues;
        $ctrl.onApproved = $ctrl.modal.scope.onApproved;

        $ctrl.form = FormBuilderService.build($ctrl.readOnly ? $ctrl.readValues : {
            limit_total: 1,
            unlimited_stock: false,
            limit_per_identity: 1,
            amount: $ctrl.readOnly ? $ctrl.product.price / 2 : 0,
            gratis: false,
        }, (form) => {
            if ($ctrl.readOnly) {
                return form.unlock();
            }

            FundService.updateProvider($ctrl.fund.organization_id, $ctrl.fund.id, $ctrl.fundProvider.id, {
                enable_products: [{
                    id: $ctrl.product.id,
                    amount: form.values.gratis ? $ctrl.product.price : form.values.amount,
                    limit_total: form.values.limit_total,
                    limit_total_unlimited: form.values.unlimited_stock ? 1 : 0,
                    limit_per_identity: form.values.limit_per_identity,
                }],
            }).then((res) => {
                $ctrl.onApproved(res.data.data);
                $ctrl.closeAnimated();
            }, (res) => {
                form.errors = res.data.errors;
                return form.unlock();
            });
        }, true);
    };

    $ctrl.closeAnimated = () => {
        $ctrl.loaded = false;
        $timeout(() => $ctrl.close(), 250);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$timeout',
        'FundService',
        'FormBuilderService',
        ModalSubsidyProductEditComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-subsidy-product-edit.html';
    }
};