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

const NotificationTemplateEditorDirective = function(
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

    const isMailOnlyVariable = ImplementationNotificationsService.isMailOnlyVariable;
    const variablesMap = ImplementationNotificationsService.variablesMap();
    const variablesMapLabels = ImplementationNotificationsService.variablesMapLabels();

    const inputIds = {
        title: `#${titleId}`,
        description: `#${descriptionId}`,
    };

    const editTemplate = () => {
        const { formal, title, content, content_html } = $dir.template;

        $dir.editForm = FormBuilderService.build({ formal, title, content, content_html }, (form) => {
            const { formal, title, content } = form.values;
            const labelsToVars = ImplementationNotificationsService.labelsToVars;

            const newTemplate = { formal, title: labelsToVars(title), content: labelsToVars(content), type: $dir.type };
            const defaultTemplate = $dir.notification.templates_default.filter(item => item.type == $dir.type)[0] || null;;

            const isSameTitle = newTemplate.title === defaultTemplate.title;
            const isSameContent = newTemplate.content === defaultTemplate.content;

            const shouldReset = isSameTitle && isSameContent;
            const data = { ...(shouldReset ? { templates_remove: [{ formal, type: $dir.type }] } : { templates: [newTemplate] }) };

            updateTemplate(data);
        }, true);
    }

    const updateTemplate = (data, form = null) => {
        ImplementationNotificationsService.update(
            $dir.organization.id,
            $dir.implementation.id,
            $dir.notification.id,
            data
        ).then((res) => {
            const pushTitle = 'Opgeslagen';
            const pushMessage = `${$dir.header.title} sjabloon opgeslagen.`
            const notification = res.data.data;

            $dir.templateUpdated({ notification });
            $dir.cancelTemplateEdit();

            PushNotificationsService.success(pushTitle, pushMessage);
        }, () => {
            const pushTitle = 'Fout!';
            const pushMessage = "Er is iets fout gegaan.";

            PushNotificationsService.danger(pushTitle, pushMessage);
        }).finally(() => form ? form.unlock() : null);
    }

    const cancelTemplateEdit = () => {
        $dir.editForm = null;
    };

    const addVariable = (type, variable) => {
        const value = `[${variable.key}]`;
        const input = $element.find(inputIds[type])[0];

        // markdown editor
        if (type == 'description' && $dir.type == 'mail') {
            $editor.instance.insertText(`[${variable.key}]`);
        } else {
            insertAtCursor(input, value).then(() => $dir.template.content = input.value);
        }
    };

    const resetToDefault = () => {
        ModalService.open("dangerZone", {
            title: "Reset to default",
            description: [
                "By resetting template to default, all the changes you made will be",
                "reverted to the initial template provided by Forus."
            ].join(" "),
            cancelButton: "Cancel",
            confirmButton: "Confirm",
            text_align: "center",
            onConfirm: () => {
                updateTemplate({ templates_remove: [{ formal: $dir.template.formal, type: $dir.type }] });
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
                content_html: ImplementationNotificationsService.labelsToBlocks(
                    $editor.summernote('code'),
                    $dir.implementation
                ),
            });
        }
    }];

    $dir.toggleSwitched = () => {
        const data = { ["enable_" + $dir.type]: $dir.enable };
        const pushTitle = 'Opgeslagen';
        const pushMessage = `${$dir.header.title} zijn nu ${$dir.enable ? 'ingeschakeld.' : 'uitgeschakeld.'}`

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

    $dir.$onInit = () => {
        const header = {
            icon: $translate('system_notifications.types.' + $dir.type + '.icon'),
            title: $translate('system_notifications.types.' + $dir.type + '.title'),
        };

        const disabledNotes = {
            enable: `${header.title} staat nu aan.`,
            disabled: `${header.title} staat nu uit.`,
        };

        const variables = $dir.notification.variables.map((variable) => {
            return {
                id: variable,
                key: variablesMap[variable],
                label: variablesMapLabels[variablesMap[variable]],
                types: isMailOnlyVariable(variable) ? ['mail'] : ['mail', 'push', 'database'],
            };
        });

        $dir.titleId = titleId;
        $dir.descriptionId = descriptionId;

        $dir.header = header;
        $dir.variables = variables;
        $dir.disabledNotes = disabledNotes;
        $dir.editorButtons = editorButtons;

        $dir.addVariable = addVariable;
        $dir.resetToDefault = resetToDefault;

        $dir.editTemplate = editTemplate;
        $dir.cancelTemplateEdit = cancelTemplateEdit;

        $dir.bindEditor = (editor) => $editor.instance = editor;

        $dir.enable = $dir.notification['enable_' + $dir.type];
        $dir.enable_all = $dir.notification.enable_all;

        // watch for enable/disabled toggles
        $scope.$watch('$dir.notification.enable_all', (enable_all) => $dir.enable_all = enable_all);
        $scope.$watch('$dir.template', (template) => template && $dir.editForm ? $dir.editTemplate() : null);
    };
};

module.exports = () => {
    return {
        scope: {
            template: '=',
        },
        bindToController: {
            type: '@',
            template: '<',
            notification: '<',
            organization: '<',
            implementation: '<',
            resetTemplate: '&',
            toggleUpdated: '&',
            templateUpdated: '&',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
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