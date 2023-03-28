const ImplementationCmsSocialMediaEditComponent = function (
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.socialMedia = [];

    $ctrl.$onInit = function() {
        let formValues = {
            facebook_url: $ctrl.implementation.facebook_url,
            twitter_url: $ctrl.implementation.twitter_url,
            youtube_url: $ctrl.implementation.youtube_url,
        };

        for(let formValueKey in formValues) {
            if (formValues[formValueKey]) {
                $ctrl.socialMedia.push(formValue);
            }
        };

        $ctrl.form = FormBuilderService.build(formValues, function(form) {
            ImplementationService.updateCMS($ctrl.organization.id, $ctrl.implementation.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message);
                form.errors = res.data.errors;
            }).finally(() => form.unlock());
        }, true);

        console.log('form values: ', $ctrl.form.values);
        console.log('socialMedia: ', $ctrl.socialMedia);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
    },
    controller: [
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsSocialMediaEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-social-media-edit.html'
};
