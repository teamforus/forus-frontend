let ToastDirective = function (
    $scope,
    $timeout,
    ToastService,
) {
    $scope.$watch(() => ToastService.getToast(), (toast) => {
        $scope.toast = toast;

        if (toast.show) {
            $scope.timeout = $timeout(() => {
                $scope.toast.show = false;
            }, 5000);
        } else {
            $scope.toast.show = false;

            if ($scope.timeout) {
                $timeout.cancel($scope.timeout);
            }
        }
    });
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
            'ToastService',
            ToastDirective
        ],
        templateUrl: 'assets/tpl/directives/toast.html'
    };
};