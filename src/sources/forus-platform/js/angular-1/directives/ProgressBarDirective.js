const ProgressBarDirective = function () { };

module.exports = () => {
    return {
        scope: {
            status: '=',
            progress: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            ProgressBarDirective,
        ],
        templateUrl: 'assets/tpl/directives/progress-bar.html',
    };
};