let PhotoSelectorDirective = function(
    $timeout,
    $scope,
    $element,
    ImageConvertorService
) {
    let input = false;

    $scope.selectFile = (e) => {
        e && e.preventDefault() && e.stopPropagation();

        if (input && input.remove) {
            input.remove();
        }

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.style.display = 'none';

        input.addEventListener('change', function(e) {
            ImageConvertorService.instance(e.target.files[0]).then((converter) => {
                $timeout(() => {
                    $scope.thumbnail = converter.resize(100, 100);
                }, 0);
            });

            $scope.selectPhoto({
                e: e
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
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$timeout',
            '$scope',
            '$element',
            'ImageConvertorService',
            PhotoSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/photo-selector.html'
    };
};