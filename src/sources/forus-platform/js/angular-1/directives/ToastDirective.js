let ToastDirective = function(
    $scope,
    $timeout,
    $interval,
    ToastService,
) {
    $interval(() => {
        $scope.toast = ToastService.getToast();

        if ($scope.toast.show) {
            $timeout(() => {
                $scope.toast.show = false;
            }, 5000);
        }
    }, 100);
};

module.exports = () => {
    return {
        scope: {
            description: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            '$interval',
            'ToastService',
            ToastDirective
        ],
        templateUrl: 'assets/tpl/directives/toast.html'
    };
};