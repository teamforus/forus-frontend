const EventLogsComponent = function (PaginatorService) {
    const $ctrl = this;

    $ctrl.paginationPerPageKey = "event_logs";

    $ctrl.$onInit = function () {
        $ctrl.filters = {
            q: "",
            per_page: PaginatorService.getPerPage($ctrl.paginationPerPageKey),
            loggable: ['fund', 'bank_connection', 'employees'],
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