const keyBy = require('lodash/keyBy');

const NotificationEditor = function(
    $scope,
    $filter,
    PushNotificationsService,
    ImplementationNotificationsService
) {
    const $dir = $scope.$dir;
    const $translate = $filter('translate');

    const { notificationHasDisabledChannels, notificationToStateLabel } = ImplementationNotificationsService;

    const notificationToggleLabel = {
        disabled: `Uitgezet, alle kanalen zijn uitgezet.`,
        enabled_all: 'Aangezet, alle kanalen zijn aangezet.',
        enabled_partial: 'Aangezet, sommige kanalen staan afzonderlijk uit.',
    };

    $dir.resetTemplate = (type) => {
        $dir.notification.templates = $dir.notification.templates.filter((item) => item.type != type);
        $dir.notification.templates_default = $dir.notification.templates_default.map((item) => ({ ...item }))
        $dir.$onInit();
    };

    $dir.updateStateLabel = () => {
        $dir.state = notificationToStateLabel($dir.notification);
    };

    $dir.toggleSwitched = () => {
        const data = { enable_all: $dir.notification.enable_all };
        const title = 'Opgeslagen';
        const hasDisabledChannels = notificationHasDisabledChannels($dir.notification);

        const message = data.enable_all ? (
            hasDisabledChannels ? notificationToggleLabel.enabled_partial : notificationToggleLabel.enabled_all
        ) : notificationToggleLabel.disabled;

        ImplementationNotificationsService.update(
            $dir.organization.id,
            $dir.implementation.id,
            $dir.notification.id,
            data
        ).then(() => {
            $dir.updateStateLabel();
            PushNotificationsService.success(title, message);
        });
    };

    $dir.onTemplateUpdated = (notification) => {
        $dir.notification = notification;
        $dir.$onInit();
    };

    $dir.$onInit = () => {
        const notification = $dir.notification;
        const templatesToFront = ImplementationNotificationsService.templatesToFront;

        const title = $translate('system_notifications.notifications.' + notification.key + '.title');
        const description = $translate('system_notifications.notifications.' + notification.key + '.description');

        const channels = notification.channels.reduce((obj, channel) => ({ ...obj, [channel]: true }), {});
        const templatesLocal = keyBy(templatesToFront(notification.templates, $dir.implementation), 'type');
        const templatesDefault = keyBy(templatesToFront(notification.templates_default, $dir.implementation), 'type');

        const templates = {
            mail: channels.mail ? templatesLocal.mail || templatesDefault.mail : null,
            push: channels.push ? templatesLocal.push || templatesDefault.push : null,
            database: channels.database ? templatesLocal.database || templatesDefault.database : null,
        };

        notification.title = title;
        notification.description = description;

        $dir.templates = templates;
        $dir.notificationToggleLabel = notificationToggleLabel;

        $dir.updateStateLabel();
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            notification: '<',
            organization: '<',
            implementation: '<',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'PushNotificationsService',
            'ImplementationNotificationsService',
            NotificationEditor
        ],
        templateUrl: 'assets/tpl/directives/elements/system-notification-editor.html'
    };
};