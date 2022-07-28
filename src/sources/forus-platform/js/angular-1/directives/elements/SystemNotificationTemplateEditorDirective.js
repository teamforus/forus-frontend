const uniqueId = require('lodash/uniqueId');

const insertAtCursor = (inputEl, str) => {
    return new Promise((resolve) => {
        if (document.selection) {
            // IE support 
            inputEl.focus();
            document.selection.createRange().text = str;
        } else if (inputEl.selectionStart || inputEl.selectionStart == '0') {
            // Others
            const value = inputEl.value;
            const start = inputEl.selectionStart;
            const end = inputEl.selectionEnd;

            inputEl.value = value.substring(0, start) + str + value.substring(end, value.length);
            inputEl.selectionStart = start + str.length;
            inputEl.selectionEnd = start + str.length;
        } else {
            // Not supported
            inputEl.value += str;
        }

        inputEl.focus();
        resolve();
    });
};

const NotificationTemplateEditorDirective = function (
    $sce,
    $scope,
    $filter,
    $element,
    ModalService,
    FormBuilderService,
    PushNotificationsService,
    ImplementationNotificationsService
) {
    const $dir = $scope.$dir;
    const $editor = {};
    const $translate = $filter('translate')

    const titleId = uniqueId('template_title_');
    const descriptionId = uniqueId('template_description_');

    const variablesMap = ImplementationNotificationsService.variablesMap();
    const variablesMapLabels = ImplementationNotificationsService.variablesMapLabels();

    const labelsToVars = ImplementationNotificationsService.labelsToVars;
    const labelsToBlocks = ImplementationNotificationsService.labelsToBlocks;
    const isMailOnlyVariable = ImplementationNotificationsService.isMailOnlyVariable;
    const contentToPreview = ImplementationNotificationsService.contentToPreview;

    const inputIds = {
        title: `#${titleId}`,
        content: `#${descriptionId}`,
    };

    const submitChanges = (notification = {}) => {
        $dir.templateUpdated({ notification });
        $dir.cancelTemplateEdit();
    }

    const updateTemplate = (data, form = null) => {
        if ($dir.compose) {
            const templates = data?.templates.map((item) => {
                return ({ ...item, ...(item.type === 'mail' ? $dir.markdownRaw : {}) });
            });

            form?.unlock();
            return submitChanges({ ...data, ...(templates ? { templates } : {}) });
        }

        ImplementationNotificationsService.update(
            $dir.organization.id,
            $dir.implementation.id,
            $dir.notification.id,
            data
        ).then((res) => {
            const pushTitle = 'Opgeslagen';
            const pushMessage = `${$dir.header.title} sjabloon opgeslagen.`

            $dir.errors = null;
            submitChanges(res.data.data);
            PushNotificationsService.success(pushTitle, pushMessage);
        }, (res) => {
            const pushTitle = 'Fout!';
            const pushMessage = "Er is iets fout gegaan.";

            if (res.status === 422) {
                $dir.errors = {
                    subject: res.data?.errors['templates.0.title'],
                    content: res.data?.errors['templates.0.content'],
                };
            }

            PushNotificationsService.danger(pushTitle, pushMessage);
        }).finally(() => form?.unlock());
    }

    const editTemplate = () => {
        const { formal, title, content, content_html } = $dir.template;
        const data = { formal, title, content, content_html };

        const submitUpdate = (form) => {
            const { formal, title, content, content_html = '' } = form.values;

            const newTemplate = {
                title: labelsToVars(title), 
                content: labelsToVars(content), 
                content_html: content_html ? labelsToVars(content_html) : null,
                ...{ formal, type: $dir.type },
            };

            const defaultTemplate = $dir.notification.templates_default.filter((item) => item.type == $dir.type)[0] || null;

            const isSameTitle = newTemplate.title === defaultTemplate.title;
            const isSameContent = newTemplate.content === defaultTemplate.content;

            const shouldReset = isSameTitle && isSameContent;
            const data = { ...(shouldReset ? { templates_remove: [{ formal, type: $dir.type }] } : { templates: [newTemplate] }) };

            updateTemplate(data, form);
        };

        const submitCompose = (form) => {
            const { formal, title, content, content_html } = form.values;
            const templates = [{ title, content: content.replace(/\\/g, ""), content_html, formal, type: $dir.type }];

            updateTemplate({ templates }, form);
        };

        const submit = $dir.compose ? submitCompose : submitUpdate;

        $dir.editForm = FormBuilderService.build(data, submit, true);

        if (typeof $dir.onEditUpdated === 'function') {
            $dir.onEditUpdated({ editing: true });
        }
    }

    const cancelTemplateEdit = () => {
        $dir.editForm = null;

        if (typeof $dir.onEditUpdated === 'function') {
            $dir.onEditUpdated({ editing: false });
        }
    };

    const addVariable = (type, variable) => {
        const value = variable.key;
        const input = $element.find(inputIds[type])[0];

        // markdown editor
        if (type == 'content' && $dir.type == 'mail') {
            $editor.instance.insertText(variable.key);
        } else {
            insertAtCursor(input, value).then(() => $dir.editForm.values[type] = input.value);
        }
    };

    const resetToDefault = () => {
        ModalService.open("dangerZone", {
            title: "Opnieuw instellen",
            description: [
                "Door het bericht opnieuw in te stellen wordt uw bericht hersteld naar de oorsponkelijke template.",
                "Deze actie is niet ongedaan te maken."
            ].join(" "),
            cancelButton: "Annuleren",
            confirmButton: "Bevestigen",
            text_align: "center",
            onConfirm: () => {
                if (!$dir.compose) {
                    updateTemplate({ templates_remove: [{ formal: $dir.template.formal, type: $dir.type }] });
                }

                $dir.resetTemplate({ type: $dir.type });
                $dir.cancelTemplateEdit();
            },
        });
    };

    const editorButtons = [{
        key: 'mailPreview',
        icon: 'mdi mdi-eye-outline',
        handler: ($editor) => {
            ModalService.open('mailPreview', {
                title: $dir.editForm.values.title,
                content_html: labelsToBlocks($editor.summernote('code'), $dir.implementation),
            });
        }
    }];

    $dir.updatedRaw = (data) => {
        $dir.markdownRaw = { content_html: data.content_html };
    }

    $dir.toggleSwitched = () => {
        const data = { ["enable_" + $dir.type]: $dir.enable };
        const pushTitle = 'Opgeslagen';
        const pushMessage = `${$dir.header.title} is nu ${$dir.enable ? 'ingeschakeld.' : 'uitgeschakeld.'}`

        ImplementationNotificationsService.update(
            $dir.organization.id,
            $dir.implementation.id,
            $dir.notification.id,
            data
        ).then(() => {
            $dir.notification['enable_' + $dir.type] = data['enable_' + $dir.type];
            $dir?.toggleUpdated({ enable: $dir.enable });
            PushNotificationsService.success(pushTitle, pushMessage);
        });
    };

    $dir.updateTemplatePreview = (template) => {
        $dir.title_preview = contentToPreview(template?.title || '', $dir.variableValues);

        if (template.type === 'mail') {
            $dir.content_preview_sce = $sce.trustAsHtml(
                labelsToBlocks(contentToPreview(template?.content_html || '', $dir.variableValues),
                $dir.implementation
            ));
        }
    }

    $dir.$onInit = () => {
        const header = {
            icon: $translate('system_notifications.types.' + $dir.type + '.icon'),
            title: $translate('system_notifications.types.' + $dir.type + '.title'),
        };

        const disabledNotes = {
            enable: `${header.title} staat nu aan.`,
            disabled: `${header.title} staat nu uit.`,
        };

        const variables = $dir.notification.variables.map((variable) => ({
            id: variable,
            key: variablesMap[`:${variable}`],
            label: variablesMapLabels[variablesMap[`:${variable}`]],
            types: isMailOnlyVariable(`:${variable}`) ? ['mail'] : ['mail', 'push', 'database'],
        }));

        $dir.titleId = titleId;
        $dir.descriptionId = descriptionId;

        $dir.header = header;
        $dir.variables = variables;
        $dir.disabledNotes = disabledNotes;
        $dir.editorButtons = editorButtons;
        $dir.compose = $dir.compose ? true : false;

        $dir.addVariable = addVariable;
        $dir.resetToDefault = resetToDefault;

        $dir.editTemplate = editTemplate;
        $dir.cancelTemplateEdit = cancelTemplateEdit;

        $dir.bindEditor = (editor) => $editor.instance = editor;

        $dir.enable = $dir.notification['enable_' + $dir.type];
        $dir.enable_all = $dir.notification.enable_all;

        // watch for enable/disabled toggles
        $scope.$watch('$dir.notification.enable_all', (enable_all) => $dir.enable_all = enable_all);
        $scope.$watch('$dir.variableValues', () => $dir.updateTemplatePreview($dir.template), true);

        $scope.$watch('$dir.template', (template) => {
            if (template && $dir.editForm) {
                $dir.editTemplate();
            }

            $dir.updateTemplatePreview(template);
        }, true);
    };
};

module.exports = () => {
    return {
        scope: {
            template: '=',
            type: '@',
            template: '<',
            compose: '<',
            notification: '<',
            organization: '<',
            implementation: '<',
            resetTemplate: '&',
            toggleUpdated: '&',
            templateUpdated: '&',
            onEditUpdated: '&',
            variableValues: '<',
            errors: '<',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$sce',
            '$scope',
            '$filter',
            '$element',
            'ModalService',
            'FormBuilderService',
            'PushNotificationsService',
            'ImplementationNotificationsService',
            NotificationTemplateEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/elements/system-notification-template-editor.html'
    };
};