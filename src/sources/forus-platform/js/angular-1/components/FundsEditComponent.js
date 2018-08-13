let FundsEditComponent = function(
    $state,
    $stateParams,
    FundService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let values = $ctrl.fund ? FundService.apiResourceToForm(
            $ctrl.fund
        ) : {
            "product_categories": [],
            "state": $ctrl.fundStates[0].value
        };

        $ctrl.form = FormBuilderService.build(values, (form) => {
            let promise;

            form.lock();

            if ($ctrl.fund) {
                promise = FundService.update(
                    $stateParams.organization_id,
                    $stateParams.fund_id,
                    form.values
                )
            } else {
                promise = FundService.store(
                    $stateParams.organization_id,
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('organization-funds', {
                    organization_id: $stateParams.organization_id
                });
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };
};

module.exports = {
    bindings: {
        fund: '<',
        fundStates: '<',
        productCategories: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'FundService', 
        'FormBuilderService', 
        FundsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html'
};