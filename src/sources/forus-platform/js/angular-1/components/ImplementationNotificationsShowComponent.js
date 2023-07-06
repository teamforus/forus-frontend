const ImplementationNotificationsShowComponent = function() {
    const $ctrl = this;

    $ctrl.$onInit = () => {};
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        notification: '<',
        implementation: '<',
    },
    controller: [
        ImplementationNotificationsShowComponent,
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications-show.html',
};