let PhotoSelectorDirective = function(
    $timeout,
    $scope,
    $element,
    ImageConvertorService,
    ModalService
) {
    let input = false;

    $scope.selectFile = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (input && input.remove) {
            input.remove();
        }

        const thumbnailSize = $scope.thumbnailSize || { x: 100, y: 100 };
        const fillStyle = typeof $scope.fillStyle === 'undefined' ? '#ffffff' : $scope.fillStyle;


        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.style.display = 'none';

        input.addEventListener('change', function(e) {
            ModalService.open('photoUploader', {
                type: $scope.type,
                getFile: () => e.target.files[0],
                submit: (file) => {
                    $scope.selectPhoto({ file });

                    ImageConvertorService.instance(file).then((converter) => {
                        $timeout(() => {
                            $scope.thumbnail = converter.resize(thumbnailSize.x, thumbnailSize.y, fillStyle)
                        }, 0);
                    });
                }
            });
        });

        $element[0].appendChild(input);

        input.click();
    };


    $scope.deleteFile = (e) => {
        $scope.resetPhoto();
    }
};

module.exports = () => {
    return {
        scope: {
            'fillStyle': '=',
            'selectPhoto': '&',
            'resetPhoto': '&',
            'thumbnail': '=',
            'thumbnailSize': '=',
            'label': '@',
            'disabled': '@',
            'descriptionTranslate': '@',
            'description': '@',
            'type': '@',
            'templateData': '=',
            'templateCallback': '&'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$timeout',
            '$scope',
            '$element',
            'ImageConvertorService',
            'ModalService',
            PhotoSelectorDirective
        ],
        templateUrl: ($el, $attr) => {
            let template = $attr.template || 'photo-selector';
            return 'assets/tpl/directives/' + template + '.html'
        }
    };
};