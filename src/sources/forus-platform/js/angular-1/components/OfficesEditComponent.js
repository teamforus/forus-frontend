let OfficesEditComponent = function(
    $state,
    $stateParams,
    OfficeService,
    MediaService,
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.media;

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

        if ($ctrl.office && $ctrl.office.photo) {
            MediaService.read($ctrl.office.photo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }
    };

    $ctrl.selectPhoto = (e) => {
        MediaService.store('office_photo', e.target.files[0]).then(function(res) {
            $ctrl.media = res.data.data;
            $ctrl.form.values.media_uid = $ctrl.media.uid;
        });
    };

    $ctrl.cancel = function () {
        $state.go('offices', {'organization_id' : $stateParams.organization_id});
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
        'MediaService', 
        'FormBuilderService', 
        OfficesEditComponent
    ],
    templateUrl: 'assets/tpl/pages/offices-edit.html'
};