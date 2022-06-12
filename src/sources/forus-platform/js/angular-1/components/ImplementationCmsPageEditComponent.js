const ImplementationCmsPageEditComponent = function(
    FormBuilderService,
    ImplementationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.modelPlaceholder = '';
    $ctrl.implementationBlocksEditor = null;
    $ctrl.blocks = {
        'detailed': {},
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
        let foundBlocks = $ctrl.implementationPage.blocks.filter(block => {
            return block.type == type && block.key == key;
        });

        return (type == 'text' && foundBlocks.length == 1) ? foundBlocks[0] : foundBlocks;
    };

    let getBlockData = (type, block_key, block_index) => {
        let empty_data = (type == 'detailed') ? [] : {
            'key'   : block_key,
            'type'  : type,
            'id'    : Date.now() + block_index,
            'description': ''
        };
        let block_data = empty_data;

        if (Object.values($ctrl.searchBlock(type, block_key)).length) {
            block_data = $ctrl.searchBlock(type, block_key);
        }

        return {
            'key' : block_key,
            'data': block_data
        };
    };

    $ctrl.transformBlocks = () => {
        let block_index = 0;
    
        $ctrl.implementationPage.detailed_blocks.forEach(block_key => {
            $ctrl.blocks.detailed[block_key] = getBlockData('detailed', block_key, block_index);
            block_index++;
        });

        $ctrl.implementationPage.text_blocks.forEach(block_key => {
            $ctrl.blocks.text[block_key] = getBlockData('text', block_key, block_index);
            block_index++;
        });
    };

    let blocksToFormData = (blocks, block_type) => {
        let res = [];

        for (const block_key in blocks[block_type]) {
            if (blocks[block_type].hasOwnProperty(block_key)) {
                let data = blocks[block_type][block_key].data;

                if (Array.isArray(data)) {
                    data.forEach(block => res[block.id] = block);
                } else {
                    res[data.id] = data;
                }
            }
        }

        return res;
    };

    let buildFormData = (data) => {
        let blocksData = {
            ...blocksToFormData(data.blocks, 'detailed'), 
            ...blocksToFormData(data.blocks, 'text')
        };

        return {
            ...data, 
            blocks: blocksData
        };
    };

    $ctrl.$onInit = () => {
        $ctrl.transformBlocks();

        $ctrl.form = FormBuilderService.build({
            ...$ctrl.implementationPage,
            blocks: $ctrl.blocks
        }, (form) => {
            const submit = () => {
                let data = buildFormData(form.values);
                
                ImplementationService.updatePage(
                    $ctrl.organization.id, 
                    $ctrl.implementationPage.implementation.id, 
                    $ctrl.implementationPage.id,
                    data
                ).then(res => {
                    PushNotificationsService.success('Opgeslagen!');
                    form.errors = {};
                    form.unlock();
                }, res => {
                    form.errors = res.data.errors;
                    PushNotificationsService.danger('Error!');
                    form.unlock();
                });
            };

            if (!$ctrl.implementationBlocksEditor) {
                submit();
            } else {
                $ctrl.implementationBlocksEditor.validate().then(res => {
                    submit();
                }, res => {
                    PushNotificationsService.danger('Error!', typeof res == 'string' ? res : res.message || '');
                    return form.unlock();
                });
            }
        }, true);
    };
};

module.exports = {
    bindings: {
        implementationPage: '<',
        organization: '<',
    },
    controller: [
        'FormBuilderService',
        'ImplementationService',
        'PushNotificationsService',
        ImplementationCmsPageEditComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-cms-page-edit.html'
};
