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

    $dir.onFundChanged = (fund) => {
        $dir.updateTemplates(fund);
    };

    $dir.updateTemplates = (fund) => {
        const notification = $dir.notification;
        const templatesToFront = ImplementationNotificationsService.templatesToFront;

        const channels = notification.channels.reduce((obj, channel) => ({ ...obj, [channel]: true }), {});
        const templatesDefault = keyBy(templatesToFront(notification.templates_default, $dir.implementation), 'type');

        const templatesImplementation = keyBy(templatesToFront(notification.templates.filter((template) => {
            return !template.fund_id;
        }), $dir.implementation, fund), 'type');

        const templatesFund = fund ? keyBy(templatesToFront(notification.templates.filter((template) => {
            return template.fund_id == fund?.id;
        }), $dir.implementation, fund), 'type') : null;

        const templates = {
            mail: channels.mail ? templatesFund?.mail || templatesImplementation?.mail || templatesDefault.mail : null,
            push: channels.push ? templatesFund?.push || templatesImplementation?.push || templatesDefault.push : null,
            database: channels.database ? templatesFund?.database || templatesImplementation.database || templatesDefault.database : null,
        };

        $dir.templates = templates;
        $dir.notificationToggleLabel = notificationToggleLabel;
        
        $dir.updateStateLabel();
    };

    $dir.$onInit = () => {
        if ($dir.funds && $dir.funds[0]?.id !== null) {
            $dir.funds = [{ id: null, name: 'All funds' }, ...$dir.funds];
            $dir.fund = $dir.funds[0];
        }

        $dir.updateTemplates($dir.fund || null);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            funds: '<',
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
            NotificationEditor,
        ],
        templateUrl: 'assets/tpl/directives/elements/system-notification-editor.html',
    };
};