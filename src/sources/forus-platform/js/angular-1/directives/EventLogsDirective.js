const EventLogsDirective = function(
    $scope,
    $timeout,
    $filter,
    EventLogService,
    PushNotificationsService
) {
    const $dir = $scope.$dir;
    const $str_limit = $filter('str_limit');

    $dir.loggables = [
        {key: 'fund', title: 'Fund'},
        {key: 'employee', title: 'Employee'},
        {key: 'bank_connection', title: 'Bank connection'},
        {key: 'voucher', title: 'Voucher'},
    ];

    $dir.resetFilters = () => {
        $dir.filters.values = angular.copy($dir.initialFilterValues);
    };

    $dir.hideFilters = () => {
        $timeout(() => $dir.filters.show = false, 0);
    };

    $dir.selectLoggable = (key) => {
        let index = $dir.filters.values.loggable.indexOf(key);

        if (index !== -1) {
            $dir.filters.values.loggable.splice(index, 1);
        } else {
            $dir.filters.values.loggable.push(key);
        }
    };

    $dir.onPageChange = (query) => {
        const filters = { ...$dir.filters.values, ...query };

        EventLogService.list($dir.organization.id, filters).then((res => {
            $dir.parseHistory(res.data);
        }), (res) => {
            PushNotificationsService.danger('Error!', res.data.message);
        });
    };

    $dir.parseHistory = (logs) => {
        $dir.logs = logs;
        $dir.logs.data = $dir.logs.data.map((item) => {
            const note_substr = item.note ? $str_limit(item.note, 40) : null;

            return { ...item, note_substr };
        });
    };

    $dir.showTooltip = (e, target) => {
        e.stopPropagation();
        e.preventDefault();

        $dir.logs.data.forEach((history) => {
            history.showTooltip = history === target;
        });
    };

    $dir.hideTooltip = (e, target) => {
        e.stopPropagation();
        e.preventDefault();

        $timeout(() => target.showTooltip = false, 0);
    };

    $scope.$watch('$dir.filterValues', $dir.$onInit);

    $dir.$onInit = () => {
        $dir.initialFilterValues = angular.copy($dir.filterValues);

        $dir.filters = {
            show: false,
            values: $dir.filterValues
        };

        $dir.onPageChange({});
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            organization: '=',
            filterValues: '<',
            hideFilterForm: '<',
            hideEntity: '<',
            blockTitle: '@',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            '$filter',
            'EventLogService',
            'PushNotificationsService',
            EventLogsDirective
        ],
        templateUrl: 'assets/tpl/directives/event-logs.html'
    };
};