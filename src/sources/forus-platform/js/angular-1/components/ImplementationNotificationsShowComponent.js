const get = require('lodash/get');
const keyBy = require('lodash/keyBy');

const ImplementationNotificationsShowComponent = function(
    $sce,
    $state,
    ImplementationNotificationsService
) {
    const $ctrl = this;

    $ctrl.notification = null;
    $ctrl.templates = null;

    $ctrl.informalTypes = {
        push: false,
        mail: false,
        database: false,
    };

    $ctrl.$onInit = () => {
        ImplementationNotificationsService.list($ctrl.organization.id, $ctrl.implementation.id).then((res) => {
            const notifications = res.data.data;/* .map((notification) => {
                const mails = notification.templates.filter(template => template.type == 'mail' && template.title);
                const database = notification.templates.filter(template => template.type == 'database' && template.title);
                const push = notification.templates.filter(template => template.type == 'push' && template.title);
                const title = get(mails[0] || mails[1] || database[0] || database[1] || push[0] || push[1] || {}, 'title');

                return { ...notification, title: title ? title : notification.key };
            }) */

            const notification = notifications.filter(notification => notification.key == $ctrl.notificationKey)[0] || null;

            if (!notification) {
                return $state.go('implementation-notifications', { organization_id: $ctrl.organization.id });
            }

            const pushTemplates = notification.templates.filter(template => template.type == 'push');
            const mailTemplates = notification.templates.filter(template => template.type == 'mail');
            const databaseTemplates = notification.templates.filter(template => template.type == 'database');

            const templates = {
                push: notification.channels.includes('push') ? keyBy(pushTemplates, (item) => item.formal ? 'formal' : 'informal') : null,
                mail: notification.channels.includes('mail') ? keyBy(mailTemplates, (item) => item.formal ? 'formal' : 'informal') : null,
                database: notification.channels.includes('database') ? keyBy(databaseTemplates, (item) => item.formal ? 'formal' : 'informal') : null,
            }

            if (templates.mail && templates.mail.formal) {
                templates.mail.formal.content_html = $sce.trustAsHtml(templates.mail.formal.content_html);
            }

            if (templates.mail && templates.mail.informal) {
                templates.mail.informal.content_html = $sce.trustAsHtml(templates.mail.informal.content_html);
            }

            $ctrl.templates = templates;
            $ctrl.notification = notification;
        });
    };
};

module.exports = {
    bindings: {
        organization: '<',
        implementation: '<',
        notificationKey: '<',
    },
    controller: [
        '$sce',
        '$state',
        'ImplementationNotificationsService',
        ImplementationNotificationsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications-show.html'
};