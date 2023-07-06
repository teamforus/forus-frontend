let HeaderNotificationsDirective = function(
    $q,
    $state,
    $scope,
    $timeout,
    $interval,
    appConfigs,
    NotificationsService
) {
    let $dir = $scope.$dir = {};
    let setReadTimeout, setReadTimeoutDelay = 2500;
    let fetchInterval, fetchIntervalDelay = 1000 * 60 * 5;

    $dir.shown = false;
    $dir.helpLink = appConfigs.help_link;

    $dir.show = function() {
        $timeout.cancel(setReadTimeout);
        $scope.readList().then(notifications => {
            $dir.shown = true;
            $dir.notifications = notifications;

            setReadTimeout = $timeout(() => {
                if ($dir.shown) {
                    $scope.readList({
                        mark_read: 1,
                    }).then(notifications => {
                        $scope.setNotifications(notifications, notifications.data);
                    });
                }
            }, setReadTimeoutDelay);
        });
    };

    $dir.hide = function() {
        $timeout.cancel(setReadTimeout);
        $dir.shown = false
    };

    $dir.toggle = function() {
        if ($dir.shown) {
            $dir.hide();
        } else {
            $dir.show();
        }
    };

    $dir.onClickOutside = function() {
        $dir.hide();
    };

    $dir.showAll = function() {
        $dir.hide();
        $state.go('notifications', {
            organization_id: $scope.organizationId
        }, {
            reload: true
        })
    };

    $scope.setNotifications = function(notifications, seenNotifications = []) {
        let seenKeys = seenNotifications.map(notification => notification.id);

        notifications.data.forEach(notification => {
            notification.seen = notification.seen || seenKeys.indexOf(notification.id) != -1;
        });

        $dir.notifications = notifications
        return $dir.notifications;
    };

    $scope.readList = function(query = {}) {
        return $q(resolve => {
            NotificationsService.list(Object.assign({
                organization_id: $scope.organizationId,
                per_page: 100,
                seen: 0,
            }, query)).then((res) => {
                resolve(res.data);
            });
        });
    };

    $scope.fetchNotifications = () => {
        $scope.readList().then(notifications => {
            $dir.notifications = $scope.setNotifications(notifications);
        });
    };

    $scope.initialize = function() {
        $interval.cancel(fetchInterval);

        fetchInterval = $interval(() => {
            $scope.fetchNotifications();
        }, fetchIntervalDelay);

        $scope.fetchNotifications();
    };

    $scope.$watch('organizationId', (id, old_id) => {
        if (!id != old_id) {
            $scope.organizationId = id;
            $scope.initialize();
        }
    });

    $scope.$on('$destroy', function() {
        $timeout.cancel(setReadTimeout);
        $interval.cancel(fetchInterval);
    });
};

module.exports = () => {
    return {
        scope: {
            organizationId: "@"
        },
        replace: true,
        controller: [
            '$q',
            '$state',
            '$scope',
            '$timeout',
            '$interval',
            'appConfigs',
            'NotificationsService',
            HeaderNotificationsDirective
        ],
        templateUrl: 'assets/tpl/directives/header-notifications.html',
    };
};