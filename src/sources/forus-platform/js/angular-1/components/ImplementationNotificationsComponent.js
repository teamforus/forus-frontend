const groupBy = require('lodash/groupBy');

const groupLabels = {
    requester_fund_request: "Deelnemers aanvraag en beoordeling",
    requester_vouchers: "Deelnemers tegoeden",
    requester_transactions: "Deelnemers reserveringen en transacties",
    provider_fund_requests: "Aanbieder aanvraag en beoordeling",
    requester_reimbursements: "Declaraties",
    provider_voucher_and_transactions: "Aanbieder reserveringen en transacties",
    sponsor: "Sponsor",
    other: "Overig"
};

const ImplementationNotificationsComponent = function(
    $state,
    $filter,
    ImplementationNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    $ctrl.$onInit = () => {
        $ctrl.groupLabels = groupLabels

        if ($ctrl.implementations.meta.total > 0) {
            this.selectImplementation($ctrl.implementations.data[0]);
        } else {
            $state.go('organizations');
        }
    };

    $ctrl.notificationIconColor = (notification, type) => {
        const templateChanged = notification.templates.filter(item => item.type == type).length > 0;

        if (!notification.channels.includes(type)) {
            return 'text-muted-light';
        }

        if (!notification.enable_all || !notification['enable_' + type]) {
            return 'text-danger-dark';
        }

        return templateChanged ? 'text-primary-dark' : 'text-success-dark';
    };

    $ctrl.notificationIcon = (notification, type) => {
        const iconOff = {
            mail: 'email-off-outline',
            push: 'cellphone-off',
            database: 'bell-off-outline',
        }[type];

        const iconsOn = {
            mail: 'email',
            push: 'cellphone',
            database: 'bell',
        }[type];

        if (!notification.channels.includes(type) || !notification.enable_all || !notification['enable_' + type]) {
            return iconOff;
        }

        return iconsOn;
    };

    $ctrl.notificationIconTooltip = (notification, type) => {
        const trans = (key) => $translate(`system_notifications.${key}`);
        const heading = trans(`types.${type}.title`);
        const templateChanged = notification.templates.filter(item => item.type == type).length > 0;

        if (!notification.channels.includes(type)) {
            return { heading, text: trans(`tooltips.channel_not_available`) };
        }

        if (!notification.enable_all || !notification['enable_' + type]) {
            return { heading, text: trans(`tooltips.disabled_by_you`)};
        }

        return { heading, text: trans('tooltips.' + (templateChanged ? 'enabled_edited' : 'enabled_default')) };
    };

    $ctrl.selectImplementation = (implementation) => {
        $ctrl.implementation = implementation;
        $ctrl.notifications = [];

        $ctrl.brandingParams = {
            organization_id: $ctrl.organization.id,
            implementation_id: $ctrl.implementation.id,
        };

        ImplementationNotificationsService.list($ctrl.organization.id, $ctrl.implementation.id).then((res) => {
            const groupOrder = Object.keys($ctrl.groupLabels);

            const notifications = res.data.data.map((notification) => {
                const title = $translate('system_notifications.notifications.' + notification.key + '.title');
                const description = $translate('system_notifications.notifications.' + notification.key + '.description');
                const state = ImplementationNotificationsService.notificationToStateLabel(notification);

                const icons = ['mail', 'push', 'database'].map((type) => ({
                    icon: $ctrl.notificationIcon(notification, type),
                    color: $ctrl.notificationIconColor(notification, type),
                    tooltip: $ctrl.notificationIconTooltip(notification, type)
                }));

                const srefData = {
                    organization_id: $ctrl.organization.id,
                    implementation_id: implementation.id,
                    id: notification.id,
                };

                return { ...notification, state, title, description, srefData, icons };
            });

            const grouped = groupBy(notifications, 'group');

            // group notification by group field and add the group labels
            // sort notifications inside the groups and then sort the groups
            const notificationGroups = Object.keys(grouped).map((group) => {
                return { group, groupLabel: $ctrl.groupLabels[group], notifications: grouped[group] };
            }).map((item) => {
                return { ...item, notifications: item.notifications.sort((a, b) => a.order - b.order) };
            }).sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));


            $ctrl.notificationGroups = notificationGroups;
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
        '$filter',
        'ImplementationNotificationsService',
        ImplementationNotificationsComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications.html'
};
