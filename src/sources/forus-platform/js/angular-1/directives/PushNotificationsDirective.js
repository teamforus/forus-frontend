let PushNotificationsDirective = function(
    $scope,
    $timeout,
    PushNotificationsService
) {
    $scope.maxCount = 4;
    $scope.notifications = [];

    PushNotificationsService.onNotification((notification) => {
        while ($scope.notifications.length > $scope.maxCount) {
            $scope.notifications.pop();
        }

        let note = $scope.pushNotification(notification);

        $scope.notifications.unshift(note);

        $timeout(() => {
            if ($scope.notifications.indexOf(note) !== -1) {
                $scope.deleteNotification(note);
            }
        }, note.timeout || 4000);
    });

    $scope.pushNotification = (notification) => {
        let note = JSON.parse(JSON.stringify(notification));

        $timeout(() => {
            note.shown = true;
        }, 300);

        return note;
    };

    $scope.deleteNotification = (note) => {
        note.shown = false;

        $timeout(() => {
            $scope.notifications.splice($scope.notifications.indexOf(note), 1);
        }, 300);
    };
};

module.exports = () => {
    return {
        scope: {
            rawPdfFile: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'PushNotificationsService',
            PushNotificationsDirective
        ],
        templateUrl: 'assets/tpl/directives/push-notifications.html'
    };
};