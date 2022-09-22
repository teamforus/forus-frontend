const NoBookmarksDirective = function($scope) {};

module.exports = () => {
    return {
        scope: {
            type: '@',
            title: '@',
            description: '@',
            buttonText: '@',
            buttonSref: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            NoBookmarksDirective
        ],
        templateUrl: 'assets/tpl/directives/no-bookmarks.html'
    };
};