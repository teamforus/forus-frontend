let PageLoadingBarDirective = function($scope, $interval, PageLoadingBarService) {
    let $dir = {
        progress: 100
    };

    $scope.$dir = $dir;
    $scope.init = () => {
        PageLoadingBarService.addListener((progress) => {
            $dir.progress = progress;
        });

        let interval = 100;
        let multiplier = .1;

        $interval(() => {
            let incrementBy = 0;

            if ($dir.progress < 50) {
                incrementBy = 10;
            } else if ($dir.progress < 75) {
                incrementBy = 5;
            } else if ($dir.progress < 90) {
                incrementBy = 2;
            } else if ($dir.progress < 95) {
                incrementBy = 1;
            } else if ($dir.progress < 98) {
                incrementBy = .25;
            } else {
                incrementBy = .1;
            }

            $dir.progress = Math.min($dir.progress + (incrementBy * multiplier), 100);
        }, interval);
    }

    $scope.init();
};

module.exports = () => {
    return {
        scope: {},
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$interval',
            'PageLoadingBarService',
            PageLoadingBarDirective
        ],
        template: require('./templates/page-loading-bar.pug'),
    };
};