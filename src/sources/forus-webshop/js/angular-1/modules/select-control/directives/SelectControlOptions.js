let SelectControlOptions = function($scope, $timeout) {
    let $dir = {};
    let optionsPreloadSize;

    $scope.$dir = $dir;

    $dir.options = [];
    $dir.displayCount = 0;

    $dir.onScrolledOption = () => {
        $dir.displayCount += optionsPreloadSize;

        $timeout(() => {
            $dir.options = $scope.options.slice(0, $dir.displayCount);
        }, 0);
    };

    $dir.select = (option) => {
        $scope.change({
            option: option
        });
    };

    $scope.$watch('options', () => {
        $dir.displayCount = 0;
        $dir.onScrolledOption();
    });

    $scope.init = () => {
        optionsPreloadSize = parseInt($scope.optionsPreloadSize || 50);
        $dir.onScrolledOption();
    }

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            change: "&",
            options: "=",
            optionsPreloadSize: "@",
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            SelectControlOptions
        ],
        template: require('./templates/select-control-options.pug'),
    };
};