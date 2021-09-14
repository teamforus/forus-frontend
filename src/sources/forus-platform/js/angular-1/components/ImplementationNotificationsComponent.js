const get = require('lodash/get');

const ImplementationNotificationsComponent = function(
    $state,
    ImplementationNotificationsService
) {
    const $ctrl = this;

    $ctrl.notifications

    $ctrl.$onInit = () => {
        if ($ctrl.implementations.meta.total > 0) {
            this.selectImplementation($ctrl.implementations.data[0]);
        } else {
            $state.go('organizations');
        }
    };

    $ctrl.selectImplementation = (implementation) => {
        $ctrl.implementation = implementation;
        $ctrl.notifications = [];

        ImplementationNotificationsService.list($ctrl.organization.id, $ctrl.implementation.id).then((res) => {
            $ctrl.notifications = res.data.data.map((notification) => {
                const mail = notification.templates.filter(template => template.type == 'mail' && template.title);
                const push = notification.templates.filter(template => template.type == 'push' && template.title);
                const database = notification.templates.filter(template => template.type == 'database' && template.title);
                const title = get(mail[0] || mail[1] || database[0] || database[1] || push[0] || push[1] || {}, 'title');

                const srefData = {
                    organization_id: $ctrl.organization.id,
                    implementation_id: implementation.id,
                    notification_key: notification.key,
                };

                return { ...notification, srefData, title: title ? title : notification.key };
            });
        });
    }
};

module.exports = {
    bindings: {
        organization: '<',
        implementations: '<',
    },
    controller: [
        '$state',
        'ImplementationNotificationsService',
        ImplementationNotificationsComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications.html'
};