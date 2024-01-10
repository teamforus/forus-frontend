const EventLogsComponent = function (PaginatorService) {
    const $ctrl = this;

    $ctrl.paginationPerPageKey = "event_logs";

    $ctrl.$onInit = function () {
        $ctrl.filters = {
            q: "",
            per_page: PaginatorService.getPerPage($ctrl.paginationPerPageKey, 25),
            loggable: ['fund', 'bank_connection', 'employee'],
        };
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        'PaginatorService',
        EventLogsComponent
    ],
    templateUrl: 'assets/tpl/pages/event-logs.html',
};