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

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.style.display = 'none';

        input.addEventListener('change', function(e) {
            ModalService.open('photoUploader', {
                type: $scope.type,
                getFile: () => {
                    return e.target.files[0];
                },
                submit: (file) => {
                    ImageConvertorService.instance(file).then((converter) => {
                        $timeout(() => {
                            $scope.thumbnail = converter.resize(100, 100);
                        }, 0);
                    });

                    $scope.selectPhoto({
                        file: file
                    });
                }
            });
        });

        $element[0].appendChild(input);

        input.click();
    };
};

module.exports = () => {
    return {
        scope: {
            'selectPhoto': '&',
            'thumbnail': '=',
            'label': '@',
            'disabled': '@',
            'descriptionTranslate': '@',
            'description': '@',
            'type': '@',
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