let ModalMarkdownCustomLinkComponent = function(
    $element,
    MediaService,
    FormBuilderService,
) {
    let $ctrl = this;
    let input = false;

    $ctrl.errors = {};

    $ctrl.$onInit = () => {
        const { type } = $ctrl.modal.scope;
        const { text, url, alt } = $ctrl.modal.scope.values;
        const values = { url, text, alt };

        $ctrl.linkType = type;

        $ctrl.form = FormBuilderService.build(values, (form) => {
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
            MediaService.store('cms_media', e.target.files[0], [
                'public'
            ]).then((res) => {
                $ctrl.errors = {};
                $ctrl.media = res.data.data;
                $ctrl.form.values.url = $ctrl.media.sizes.public;
                $ctrl.form.values.uid = $ctrl.media.uid;
            }, (res) => $ctrl.errors = res.data.errors);
        });

        $element[0].appendChild(input);

        input.click();
    };
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