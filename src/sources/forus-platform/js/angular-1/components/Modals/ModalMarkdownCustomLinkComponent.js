let ModalMarkdownCustomLinkComponent = function(
    $element,
    MediaService,
    FormBuilderService,
) {
    let $ctrl = this;
    let input = false;

    $ctrl.$onInit = () => {
        $ctrl.params = {
            type: $ctrl.modal.scope.type,
            hasDescription: $ctrl.modal.scope.hasDescription,
            description: $ctrl.modal.scope.selection
        };

        $ctrl.form = FormBuilderService.build({}, (form) => {
            $ctrl.modal.scope.success(form.values);
            $ctrl.close();
        });
    };

    $ctrl.selectMedia = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (input && input.remove) {
            input.remove();
        }

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.style.display = 'none';

        input.addEventListener('change', async (e) => {
            let res = await MediaService.store('cms_media', e.target.files[0], [
                'public'
            ]);

            $ctrl.media = res.data.data;
            $ctrl.form.values.url = $ctrl.media.sizes.public;
            $ctrl.form.values.uid = $ctrl.media.uid;
        });

        $element[0].appendChild(input);

        input.click();
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
        type: '='
    },
    controller: [
        '$element',
        'MediaService',
        'FormBuilderService',
        ModalMarkdownCustomLinkComponent
    ],
    templateUrl: () => {
        return '/assets/tpl/modals/modal-markdown-custom-link.html';
    }
};