const NotificationsComponent = function (
    $q,
    $timeout,
    NotificationsService
) {
    const $ctrl = this;
    let timeout, timeoutThreshold = 2500;

    $ctrl.loaded = false;
    $ctrl.filters = {
        values: { per_page: 10 },
        lastFilters: {}
    };

    $ctrl.readList = function (query = {}) {
        return $q(resolve => {
            NotificationsService.list(Object.assign(
                $ctrl.filters.lastFilters, query
            )).then((res) => {
                resolve(res.data);
            });
        });
    };

    $ctrl.onPageChange = function (query) {
        $timeout.cancel(timeout);

        return $q((resolve, reject) => {
            $ctrl.filters.lastFilters = Object.assign({}, query, $ctrl.filters.values);

            $ctrl.readList().then((res => {
                resolve($ctrl.setNotifications(res));

                if ($ctrl.notifications.data.filter(
                    notification => !notification.seen
                ).length > 0) {
                    timeout = $timeout(() => {
                        $ctrl.readList({
                            mark_read: 1,
                        }).then(notifications => {
                            $ctrl.setNotifications(notifications, notifications.data);
                        });
                    }, timeoutThreshold);
                }
            }), reject);
        });
    };

    $ctrl.setNotifications = function (notifications, seenNotifications = []) {
        let seenKeys = seenNotifications.map(notification => notification.id);

        notifications.data.forEach(notification => {
            notification.seen = notification.seen || seenKeys.indexOf(notification.id) != -1;
        });

        return $ctrl.notifications = notifications
    };

    $ctrl.$onInit = function () {
        $ctrl.onPageChange().then(() => {
            $timeout(() => {
                $ctrl.loaded = true;
            }, 0);
        });
    };

    $ctrl.onDestroy = function () {
        $timeout.cancel(timeout);
    };
}

module.exports = {
    bindings: {},
    controller: [
        '$q',
        '$timeout',
        'NotificationsService',
        NotificationsComponent
    ],
    templateUrl: 'assets/tpl/pages/notifications.html'
};