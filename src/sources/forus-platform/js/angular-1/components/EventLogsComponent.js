const EventLogsComponent = function () {
    const $ctrl = this;

    $ctrl.$onInit = function () {
        $ctrl.filters = {
            q: "",
            per_page: 15,
            loggable: ['fund', 'bank_connection', 'employee'],
        };
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        EventLogsComponent
    ],
    templateUrl: 'assets/tpl/pages/event-logs.html',
};