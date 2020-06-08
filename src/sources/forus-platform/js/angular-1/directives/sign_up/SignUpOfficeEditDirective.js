let SignUpOfficeEditDirective = function(
    $scope,
    $element,
    $timeout,
    $filter,
    MediaService,
    OfficeService,
    FormBuilderService
) {
    let $translate = $filter('translate');
    let officeMediaFile = false;
    let $dir = $scope.$dir = {};

    $scope.buildForm = (values) => {
        return FormBuilderService.build(values, (form) => {
            let submit = function() {
                let promise;
                let created = false;

                if (form.values.id) {
                    promise = OfficeService.update(
                        $scope.organization.id,
                        form.values.id,
                        form.values
                    )
                } else {
                    promise = OfficeService.store(
                        $scope.organization.id,
                        form.values
                    )
                    created = true;
                }

                promise.then(() => {
                    if (created) {
                        $scope.created();
                    } else {
                        $scope.updated();
                    }
                }, (res) => {
                    form.errors = res.data.errors;
                    // Temporary fix
                    for (let errorKey in form.errors) {
                        if (errorKey.indexOf('schedule') != -1) {
                            form.errors.schedule = $translate('offices_edit.errors.schedule');
                        }
                    }
                    form.unlock();
                });
            };

            if (officeMediaFile) {
                MediaService.store('office_photo', officeMediaFile).then(res => {
                    form.values.media_uid = res.data.data.uid;
                    officeMediaFile = false;
                    submit();
                });
            } else {
                submit();
            }
        }, true);
    };


    $dir.selectOfficePhoto = (file) => officeMediaFile = file;

    $scope.addMapAutocomplete = () => {
        let autocompleteOptions = {
            componentRestrictions: {
                country: "nl"
            },
        };

        let autocompleteFrom = new google.maps.places.Autocomplete(
            $element.find('#office_address')[0],
            autocompleteOptions
        );

        google.maps.event.addListener(autocompleteFrom, 'place_changed', function() {
            $dir.form.values.address = autocompleteFrom.getPlace().formatted_address;
        });
    }

    $scope.init = () => {
        $dir.form = $scope.buildForm({ 
            phone: $scope.organization.phone 
        });

        if ($scope.office) {
            $dir.form.values = angular.copy($scope.office);
        }

        $dir.form.values.schedule = $dir.form.values.schedule || {};

        $timeout(() => $scope.addMapAutocomplete(), 0);
    };

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            office: '=',
            organization: '=',
            cancel: '&',
            created: '&',
            updated: '&',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            '$timeout',
            '$filter',
            'MediaService',
            'OfficeService',
            'FormBuilderService',
            SignUpOfficeEditDirective
        ],
        templateUrl: 'assets/tpl/directives/sign_up/sign_up-office-edit.html'
    };
};