let OrganizationNotificationsComponent = function(
    $q,
    $scope,
    $timeout,
    LocalStorageService,
    NotificationsService
) {
    let $ctrl = this;
    let timeout, timeoutThreshold = 2500;

    $ctrl.paginationStorageKey = 'notifications_per_page';

    $ctrl.loaded = false;
    $ctrl.filters = {
        values: {
            per_page: LocalStorageService.getCollectionItem('pagination', $ctrl.paginationStorageKey, 10),
        },
        lastFilters: {}
    };

    $scope.readList = function(query = {}) {
        return $q(resolve => {
            NotificationsService.list(Object.assign(
                $ctrl.filters.lastFilters, query
            )).then((res) => {
                resolve(res.data);
            });
        });
    };

    $scope.onPageChange = function(query) {
        $timeout.cancel(timeout);

        return $q((resolve, reject) => {
            $ctrl.filters.lastFilters = Object.assign({
                organization_id: $ctrl.organization.id
            }, query, $ctrl.filters.values);

            $scope.readList().then((res => {
                resolve($scope.setNotifications(res));

                if ($ctrl.notifications.data.filter(
                    notification => !notification.seen
                ).length > 0) {
                    timeout = $timeout(() => {
                        $scope.readList({
                            mark_read: 1,
                        }).then(notifications => {
                            $scope.setNotifications(notifications, notifications.data);
                        });
                    }, timeoutThreshold);
                }
            }), reject);
        });
    };

    $scope.setNotifications = function(notifications, seenNotifications = []) {
        let seenKeys = seenNotifications.map(notification => notification.id);

        notifications.data.forEach(notification => {
            notification.seen = notification.seen || seenKeys.indexOf(notification.id) != -1;
        });

        return $ctrl.notifications = notifications
    };

    $ctrl.$onInit = function() {
        $scope.onPageChange().then(() => {
            $timeout(() => {
                $ctrl.loaded = true;
            }, 0);
        });
    };

    $ctrl.onDestroy = function() {
        $timeout.cancel(timeout);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        roles: '<',
    },
    controller: [
        '$q',
        '$scope',
        '$timeout',
        'LocalStorageService',
        'NotificationsService',
        OrganizationNotificationsComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-notifications.html'
};