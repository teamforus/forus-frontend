let PhotoSelectorDirective = function(
    $q,
    $scope,
    $element
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
            '$q',
            '$scope',
            '$element',
            PhotoSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/photo-selector.html' 
    };
};