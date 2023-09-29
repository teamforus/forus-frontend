const EventLogsDirective = function (
    $scope,
    $filter,
    appConfigs,
    EventLogService,
    PermissionsService,
    LocalStorageService,
    PushNotificationsService
) {
    const $dir = $scope.$dir;
    const $strLimit = $filter('str_limit');

    $dir.paginationStorageKey = 'event_logs_per_page';

    const loggables = [
        { key: 'fund', title: 'Fonds' },
        { key: 'employee', title: 'Medewerker' },
        { key: 'bank_connection', title: 'Bank integratie' },
        { key: 'voucher', title: 'Vouchers' },
    ];

    const filterPermissions = (loggable) => {
        return loggable.filter((item) => {
            return PermissionsService.hasPermission($dir.organization, $dir.permissionsMap[item]);
        })
    };

    $dir.filters = {
        values: {
            per_page: LocalStorageService.getCollectionItem('pagination', $dir.paginationStorageKey, 15),
        },
        visible: false,
        initialValues: {},
        hide: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = false;
        },
        show: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.visible = true;
        },
        reset: (e) => {
            e?.preventDefault();
            e?.stopPropagation();

            $dir.filters.values = angular.copy($dir.filters.initialValues);
        },
    };

    $dir.selectLoggable = (key) => {
        const index = $dir.filters.values.loggable.indexOf(key);

        if (index !== -1) {
            $dir.filters.values.loggable.splice(index, 1);
        } else {
            $dir.filters.values.loggable.push(key);
        }
    };

    $dir.onPageChange = (query = {}) => {
        const filters = { ...$dir.filters.values, ...query };

        filters.loggable = filterPermissions(filters.loggable);

        EventLogService.list($dir.organization.id, filters).then((res) => {
            $dir.logs = {
                meta: res.data.meta,
                data: res.data.data.map((item) => ({
                    ...item, note_substr: item.note ? $strLimit(item.note, 40) : null,
                })),
            };
        }, (res) => PushNotificationsService.danger('Error!', res.data.message));
    };

    $dir.showTooltip = (e, target) => {
        e?.stopPropagation();
        e?.preventDefault();

        $dir.logs.data.forEach((history) => history.showTooltip = history === target);
    };

    $dir.hideTooltip = (e, log) => {
        e?.stopPropagation();
        e?.preventDefault();

        log.showTooltip = false;
    };

    $dir.onExternalFilterUpdated = () => {
        $dir.filters.initialValues = angular.copy($dir.filterValues);
        $dir.filters.reset();

        $dir.onPageChange($dir.filters.values);
    };

    $dir.onAuthUserUpdated = (authUser) => {
        $dir.authUser = authUser;
    };

    $dir.$onInit = () => {
        if ($dir.register) {
            $dir.register({ directive: $dir });
        }

        $dir.loggables = loggables;
        $dir.permissionsMap = appConfigs.features.event_permissions;

        $scope.$watch('$dir.filterValues', $dir.onExternalFilterUpdated, true);
        $scope.$watch('$root.auth_user', $dir.onAuthUserUpdated);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            watch: '<',
            organization: '=',
            filterValues: '=',
            hideFilterForm: '<',
            hideEntity: '<',
            register: '&',
            blockTitle: '@',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'appConfigs',
            'EventLogService',
            'PermissionsService',
            'LocalStorageService',
            'PushNotificationsService',
            EventLogsDirective
        ],
        templateUrl: 'assets/tpl/directives/event-logs.html'
    };
};