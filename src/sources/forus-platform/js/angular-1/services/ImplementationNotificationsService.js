const ImplementationNotificationsService = function ($sce, ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
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
            const mailOnlyVars = [':qr_token', ':email_logo', ':email_signature'];
            const mailOnlyVarEndings = [':_link', ':_link_clarification', ':_button'];

            return mailOnlyVars.includes(variable) ||
                mailOnlyVarEndings.filter((ending) => variable.endsWith(ending)).length > 0;
        };

        this.varsToLabels = (template, varsMap = null) => {
            const vars = varsMap ? varsMap : this.variablesMap();

            return this.replaceTemplateValues(template, vars, true);
        };

        this.labelsToVars = (template, varsMap = null) => {
            const vars = varsMap ? varsMap : this.variablesMap();

            return this.replaceTemplateValues(template.replace(/\\/g, ''), vars, false);
        };

        this.contentToPreview = (content, variableValues = {}) => {
            const variablesMap = this.variablesMap();

            return this.replaceTemplateValues(content, Object.keys(variableValues).reduce((vars, key) => {
                return { ...vars, [variablesMap[`:${key}`]]: variableValues[key] };
            }, {}));
        };

        this.replaceTemplateValues = (template, vars, byKey = true) => {
            const varsKeys = Object.keys(vars).sort((a, b) => b.length - a.length);

            const data = varsKeys.reduce((value, key) => {
                return [...value, byKey ? { from: key, to: [vars[key]] } : { from: [vars[key]], to: key }];
            }, []);

            return data.reduce((template, value) => template.replaceAll(value.from, value.to), template);
        };

        this.labelsToBlocks = (template, implementation = null) => {
            const AwesomeQR = require('../libs/AwesomeQrCode');
            const qrCodeEl = document.createElement('img');
            const { email_signature, email_signature_default } = implementation;
            const { email_color, email_color_default } = implementation;
            const { email_logo, email_logo_default } = implementation;

            const logo = implementation ? (email_logo ? email_logo : email_logo_default) : null;
            const color = implementation ? (email_color ? email_color : email_color_default) : null;
            const signature = implementation ? (email_signature ? email_signature : email_signature_default) : null;

            const logo_url = logo ? logo.sizes.large : null;

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
                .replaceAll("[webshop_button]", [
                    `<div class="text-center">`,
                    `<span class="mail_btn" style="${color ? `background-color: ${color}` : ''};">Ga naar webshop</span>`,
                    `</div>`,
                ].join(""))
                .replaceAll("[email_logo]", '<img style="width: 300px; display: block; margin: 0 auto;" src="' + logo_url + '"/>')
                .replaceAll("[email_signature]", signature)
                .replaceAll("[qr_code]", '<img class="mail_qr" src="' + qrCodeEl.src + '"/>');
        };

        this.templatesToFront = (templates, implementation = null) => {
            return templates.map((template) => {
                const title = this.varsToLabels(template.title);
                const content = this.varsToLabels(template.content);

                const content_html = template.content_html ? this.varsToLabels(template.content_html) : null;
                const content_html_sce = template.content_html ? this.labelsToBlocks(content_html, implementation) : null;

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