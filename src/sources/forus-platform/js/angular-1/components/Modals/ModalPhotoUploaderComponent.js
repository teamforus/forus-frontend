let ModalTestComponent = function(
    $element,
    MediaService,
    ImageConvertorService
) {
    let $ctrl = this;

    $ctrl.cancel = $ctrl.close;
    $ctrl.targetFile = false;

    $ctrl.$onInit = () => {
        $ctrl.mediaConfig = MediaService.configByType($ctrl.modal.scope.type);
        $ctrl.cropFile($ctrl.modal.scope.getFile());
    };

    $ctrl.cropFile = (file) => {
        $ctrl.targetFile = file;

        ImageConvertorService.instance($ctrl.targetFile).then((convertor) => {
            $ctrl.originalRatio = convertor.originalRatio();
            $ctrl.originalPhoto = convertor.getImage().src;
        });
    };

    $ctrl.changePhoto = () => {
        let input = document.createElement('input');

        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.style.display = 'none';

        input.addEventListener('change', function(e) {
            $ctrl.cropFile(e.target.files[0]);
        });

        $element[0].appendChild(input);

        input.click();
    };

    $ctrl.onChange = () => {
        setTimeout(() => {
            if (!$ctrl.cropedPhoto) return;

            ImageConvertorService.instance(
                ImageConvertorService.dataURItoBlob($ctrl.cropedPhoto)
            ).then((convertorPreview) => {
                $ctrl.thumbnailUri = convertorPreview.resize(
                    $ctrl.mediaConfig.size.thumbnail[0],
                    $ctrl.mediaConfig.size.thumbnail[1]
                );
            })
        }, 0);
    };

    $ctrl.apply = () => {
        let file = new File([
            ImageConvertorService.dataURItoBlob($ctrl.cropedPhoto)
        ], $ctrl.targetFile.name, {
            lastModified: $ctrl.targetFile.lastModified
        });

        $ctrl.modal.scope.submit(file);
        $ctrl.close();
    };

    this.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$element',
        'MediaService',
        'ImageConvertorService',
        ModalTestComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-photo-upload.html';
    }
};