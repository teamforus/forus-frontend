const ImplementationNotificationsService = function($sce, ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = (organization_id, implementation_id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${implementation_id}/system-notifications`, query);
        };

        this.show = (organization_id, implementation_id, id) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${implementation_id}/system-notifications/${id}`);
        };

        this.update = (organization_id, implementation_id, id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${implementation_id}/system-notifications/${id}`, data);
        };

        this.notificationHasDisabledChannels = (notification) => {
            return [
                notification.channels.includes('database') ? notification.enable_database : true,
                notification.channels.includes('push') ? notification.enable_push : true,
                notification.channels.includes('mail') ? notification.enable_mail : true,
            ].filter(item => !item).length > 0;
        };

        this.variablesMap = () => require('../constants/notification_templates/variables.json');
        this.variablesMapLabels = () => require('../constants/notification_templates/variables_labels.json');

        this.isMailOnlyVariable = (variable) => {
            const mailOnlyVars = ['qr_token'];
            const mailOnlyVarEndings = ['_link', '_link_clarification', '_button'];

            return mailOnlyVars.includes(variable) ||
                mailOnlyVarEndings.filter((ending) => variable.endsWith(ending)).length > 0;
        };

        this.varsToLabels = (template) => {
            const vars = this.variablesMap();

            return Object.keys(vars).reduce((template, key) => {
                return template.replaceAll(":" + key, "[" + vars[key] + "]");
            }, template);
        };

        this.labelsToVars = (template) => {
            const vars = this.variablesMap();

            return Object.keys(vars).reduce((template, key) => {
                return template.replaceAll("[" + vars[key] + "]", ":" + key);
            }, template.replace(/\\/g, ''));
        };

        this.labelsToBlocks = (template) => {
            const AwesomeQR = require('../libs/AwesomeQrCode');
            const qrCodeEl = document.createElement('img');

            AwesomeQR.create({
                text: JSON.stringify({
                    type: "voucher",
                    value: "0xbfeb14d52b8f8fb8b95d377a21c2260f33bf2362",
                }),
                size: 300,
                margin: 0,
                dotScale: 1,
                bindElement: qrCodeEl,
                logoImage: undefined,
                backgroundImage: undefined,
            });

            return template
                .replaceAll("[webshop_button]", '<div class="text-center"><span class="mail_btn">Ga naar webshop</span></div>')
                .replaceAll("[qr_code]", '<img class="mail_qr" src="' + qrCodeEl.src + '"/>');
        };

        this.templatesToFront = (templates) => {
            return templates.map((template) => {
                const title = this.varsToLabels(template.title);
                const content = this.varsToLabels(template.content);
 
                const content_html = template.content_html ? this.varsToLabels(template.content_html) : null;
                const content_html_sce = template.content_html ? this.labelsToBlocks(content_html) : null;

                return { ...template, title, content, content_html, content_html_sce: $sce.trustAsHtml(content_html_sce) };
            })
        };

        this.notificationStateLabel = () => {
            return {
                inactive: `Inactief`,
                active: 'Actief',
                active_partly: 'Gedeeltelijk',
            };
        }

        this.notificationToStateLabel = (notification) => {
            const notificationStateLabel = this.notificationStateLabel();
            const hasDisabledChannels = this.notificationHasDisabledChannels(notification);

            const state = notification.enable_all ? (hasDisabledChannels ? 'active_partly' : 'active') : 'inactive';
            const stateLabel = notificationStateLabel[state];

            return { state, stateLabel };
        };
    });
};

module.exports = [
    '$sce',
    'ApiRequest',
    ImplementationNotificationsService
];