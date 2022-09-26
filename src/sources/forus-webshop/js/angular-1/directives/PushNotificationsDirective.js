const PushNotificationsDirective = function(
    $scope,
    $timeout,
    PushNotificationsService
) {
    $scope.maxCount = $scope.maxCount || 4;

    $scope.notifications = [];

    PushNotificationsService.onNotification((notification) => {
        if ($scope.group != notification.group) {
            return null;
        }

        while ($scope.notifications.filter((item) => item.shown).length >= $scope.maxCount) {
            $scope.deleteNotification($scope.notifications[$scope.notifications.length - 1]);
        }

        const note = $scope.pushNotification(notification);

        $scope.notifications.unshift(note);

        if (note.timeout !== false) {
            $timeout(() => {
                if ($scope.notifications.indexOf(note) !== -1) {
                    $scope.deleteNotification(note);
                }
            }, note.timeout || 4000);
        }
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
            maxCount: '@',
            group: '@',
            type: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            'PushNotificationsService',
            PushNotificationsDirective
        ],
        templateUrl: 'assets/tpl/directives/push-notifications.html',
    };
};