const ImplementationCmsPageEditComponent = function(
    $scope,
    $timeout,
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.modelPlaceholder = '';
    $ctrl.implementationBlocksEditor = null;
    $ctrl.blocks = {
        'overview': {},
        'text': {},
    };

    $ctrl.appendMedia = (media_uid, formValue) => {
        if (!Array.isArray(formValue.media_uid)) {
            formValue.media_uid = [];
        }

        formValue.media_uid.push(media_uid);
    };

    $ctrl.registerImplementationBlocksEditor = function(childRef) {
        $ctrl.implementationBlocksEditor = childRef;
    };

    $ctrl.searchBlock = (type, key) => {
        return $ctrl.implementationPage.blocks.find(block => {
            return block.type == type && block.key == key;
        });
    };

    $ctrl.transformBlocks = () => {
        $timeout(() => {
            $ctrl.implementationPage.overview_blocks.forEach((block_key) => {
                $ctrl.blocks.overview[block_key] = $ctrl.searchBlock('overview', block_key) || {};
                $scope.$apply();
            });

            $ctrl.implementationPage.text_blocks.map((block_key) => {
                $ctrl.blocks.text[block_key] = $ctrl.searchBlock('text', block_key) || {};
                $scope.$apply();
            });
        }, 0);
    };

    $ctrl.$onInit = () => {
        $ctrl.transformBlocks();

        $ctrl.form = FormBuilderService.build({
            ...$ctrl.implementationPage,
            blocks: $ctrl.blocks
        }, (form) => {
            const submit = () => {
                ImplementationService.updatePage(
                    $ctrl.organization.id, 
                    $ctrl.implementationPage.implementation.id, 
                    $ctrl.implementationPage.id,
                    form.values
                ).then(res => {
                    PushNotificationsService.success('Opgeslagen!');
                    form.unlock();
                }, res => {
                    form.errors = res.data.errors;
                    PushNotificationsService.danger('Error!');
                    form.unlock();
                });
            };

            $ctrl.implementationBlocksEditor.validate().then(res => {
                submit();
            }, res => {
                PushNotificationsService.danger('Error!', typeof res == 'string' ? res : res.message || '');
                return form.unlock();
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        implementationPage: '<',
        organization: '<',
    },
    controller: [
        '$scope',
        '$timeout',
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsPageEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-page-edit.html'
};
