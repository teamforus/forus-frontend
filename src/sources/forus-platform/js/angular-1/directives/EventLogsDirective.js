const EventLogsDirective = function (
    $scope,
    $filter,
    EventLogService,
    PushNotificationsService
) {
    const $dir = $scope.$dir;
    const $str_limit = $filter('str_limit');

    $dir.loggables = [
        { key: 'fund', title: 'Fund' },
        { key: 'employee', title: 'Employee' },
        { key: 'bank_connection', title: 'Bank connection' },
        { key: 'voucher', title: 'Voucher' },
    ];

    $dir.filters = {
        values: {},
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

        EventLogService.list($dir.organization.id, filters).then((res) => {
            $dir.logs = {
                meta: res.data.meta,
                data: res.data.data.map((item) => ({
                    ...item, note_substr: item.note ? $str_limit(item.note, 40) : null,
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

    $dir.$onInit = () => {
        if ($dir.register) {
            $dir.register({ directive: $dir });
        }

        $scope.$watch('$dir.filterValues', $dir.onExternalFilterUpdated, true);
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
            'EventLogService',
            'PushNotificationsService',
            EventLogsDirective
        ],
        templateUrl: 'assets/tpl/directives/event-logs.html'
    };
};