const NoBookmarksBlockDirective = function($scope) {};

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
            NoBookmarksBlockDirective
        ],
        templateUrl: 'assets/tpl/directives/no-bookmarks-block.html'
    };
};