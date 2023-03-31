let ModalAddSocialMediaComponent = function(
    FormBuilderService,
) {
    let $ctrl = this;

    $ctrl.socialMediaTypes = [{
        key: 'facebook',
        name: 'Facebook',
    }, {
        key: 'twitter',
        name: 'Twitter',
    }, {
        key: 'youtube',
        name: 'Youtube',
    }];

    $ctrl.buildForm = (values, onSubmit) => {
        return FormBuilderService.build(values, (form) => {
            onSubmit(form, $ctrl);
            $ctrl.close();
        });
    }

    $ctrl.$onInit = () => {
        const { socialMediaType, socialMediaLink, socialMediaTitle, onSubmit } = $ctrl.modal.scope;

        $ctrl.form = $ctrl.buildForm({
            type:  socialMediaType  || 'facebook',
            link:  socialMediaLink  || '',
            title: socialMediaTitle || '',
        }, onSubmit);
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        'FormBuilderService',
        ModalAddSocialMediaComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-add-social-media.html';
    }
};