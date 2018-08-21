let FundsEditComponent = function(
    $state,
    $stateParams,
    FundService,
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;
    
    $ctrl.media;

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

        if ($ctrl.fund && $ctrl.fund.logo) {
            MediaService.read($ctrl.fund.logo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }
    };
    
    $ctrl.selectPhoto = (e) => {
        MediaService.store('fund_logo', e.target.files[0]).then(function(res) {
            $ctrl.media = res.data.data;
            $ctrl.form.values.media_uid = $ctrl.media.uid;
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
        'MediaService', 
        FundsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html'
};