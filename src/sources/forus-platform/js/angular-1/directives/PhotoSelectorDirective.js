let PhotoSelectorDirective = function(
    $q,
    $scope
) {
    $scope.selectFile = (e) => {
        e && e.preventDefault() && e.stopPropagation();

        let input = document.createElement('input');

        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");

        input.addEventListener('change', function(e) {
            $scope.selectPhoto({
                e: e
            });
        });

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
            PhotoSelectorDirective
        ],
        templateUrl: 'assets/tpl/directives/photo-selector.html' 
    };
};