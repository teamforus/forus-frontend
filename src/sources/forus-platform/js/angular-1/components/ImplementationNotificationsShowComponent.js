const ImplementationNotificationsShowComponent = function(ImplementationNotificationsService) {
    const $ctrl = this;

    $ctrl.$onInit = () => {};
};

module.exports = {
    bindings: {
        organization: '<',
        notification: '<',
        implementation: '<',
    },
    controller: [
        'ImplementationNotificationsService',
        ImplementationNotificationsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications-show.html'
};