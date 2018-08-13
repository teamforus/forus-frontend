let OfficesEditComponent = function(
    $state,
    $stateParams,
    OfficeService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let values = OfficeService.apiResourceToForm(
            $ctrl.office || {}
        );

        $ctrl.form = FormBuilderService.build(values, (form) => {
            let promise;

            form.lock();

            if ($ctrl.office) {
                promise = OfficeService.update(
                    $stateParams.organization_id,
                    $stateParams.office_id,
                    form.values
                )
            } else {
                promise = OfficeService.store(
                    $stateParams.organization_id,
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('offices', {
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
        office: '<'
    },
    controller: [
        '$state', 
        '$stateParams', 
        'OfficeService', 
        'FormBuilderService', 
        OfficesEditComponent
    ],
    templateUrl: 'assets/tpl/pages/offices-edit.html'
};