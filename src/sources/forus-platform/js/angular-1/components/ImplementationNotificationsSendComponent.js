const ImplementationNotificationsSendComponent = function (
    $sce,
    $state,
    $filter,
    FundService,
    ModalService,
    PageLoadingBarService,
    PushNotificationsService,
    FundIdentitiesExportService,
    ImplementationNotificationsService
) {
    const $ctrl = this;

    const $translate = $filter('translate');
    const $translateKey = 'modals.danger_zone.confirm_custom_sponsor_email_notification';
    const $translateDangerZone = (key, params) => $translate(`${$translateKey}.${key}`, params);
    const contentToPreview = ImplementationNotificationsService.contentToPreview;

    const targets = [{
        value: "all",
        name: 'All people with active vouchers',
    }, {
        value: "has_balance",
        name: 'People with balance more than 0 or unused product vouchers.',
    }];

    $ctrl.targets = targets;
    $ctrl.submitting = false;
    $ctrl.submittingToSelf = false;
    $ctrl.lastQuery = '';

    $ctrl.identitiesFilters = {
        order_by: 'id',
        order_dir: 'asc',
        target: targets[0].value,
        per_page: 10,
    };

    $ctrl.setEditing = (editing) => {
        $ctrl.editing = editing;
    };

    $ctrl.updateVariableValues = () => {
        $ctrl.variableValues = {
            fund_name: $ctrl.fund?.name,
            sponsor_name: $ctrl.fund?.organization.name,
        };
    };

    $ctrl.onFundChange = () => {
        $ctrl.identitiesFilters = { ...$ctrl.identitiesFilters };
        $ctrl.updateVariableValues();
    };

    $ctrl.resetTemplate = (type) => {
        $ctrl.template = $ctrl.notification.templates_default.find((item) => item.type == type);
        $ctrl.$onInit();
    };

    $ctrl.exportIdentities = () => {
        FundIdentitiesExportService.export($ctrl.organization.id, $ctrl.fund.id, $ctrl.identitiesFilters);
    };

    $ctrl.identitiesOnPageChange = (query = {}) => {
        PageLoadingBarService.setProgress(0);

        FundService.listIdentities($ctrl.organization.id, $ctrl.fund.id, query).then((res) => {
            $ctrl.identities = res.data;
        }, (res) => {
            PushNotificationsService.danger('Error!', res.data.message);
        }).finally(() => {
            $ctrl.lastQuery = query.q;
            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.onTemplateUpdated = (notification) => {
        const templates = notification?.templates || $ctrl.notification?.templates_default;
        const template = templates.find((item) => item.type === 'mail');

        $ctrl.template = { ...$ctrl.template, ...template }

        $ctrl.template.content_html_sce = $sce.trustAsHtml(contentToPreview(
            $ctrl.template.content_html,
            $ctrl.variableValues
        ));
    };

    $ctrl.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description', { identity_count: $ctrl.identities.meta.counts.selected }),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm,
            text_align: 'center',
        });
    };

    $ctrl.askConfirmationToMyself = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title_self'),
            description: $translateDangerZone('description_self'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm,
            text_align: 'center',
        });
    };

    $ctrl.submit = () => {
        if ($ctrl.submitting) {
            return false;
        }

        $ctrl.askConfirmation(() => {
            $ctrl.submitting = true;
            PageLoadingBarService.setProgress(0);

            FundService.sendNotification($ctrl.organization.id, $ctrl.fund.id, {
                ...$ctrl.identitiesFilters,
                subject: $ctrl.template.title,
                content: $ctrl.template.content,
            }).then(() => {
                $state.go('implementation-notifications', $ctrl.implementation);

                PushNotificationsService.success(
                    'Success!',
                    'Notifications will soon be delivered to the users.',
                    'check',
                    { timeout: 8000 }
                );
            }, (res) => {
                $ctrl.submitting = false;
                PushNotificationsService.danger('Error!', res.data.message);
            }).finally(() => PageLoadingBarService.setProgress(100));
        });
    };

    $ctrl.sendToMyself = () => {
        const labelsToVars = ImplementationNotificationsService.labelsToVars;

        if ($ctrl.submittingToSelf) {
            return;
        }

        $ctrl.askConfirmationToMyself(() => {
            $ctrl.submittingToSelf = true;
            PageLoadingBarService.setProgress(0);

            FundService.sendNotification($ctrl.organization.id, $ctrl.fund.id, {
                target: 'self',
                subject: labelsToVars($ctrl.template.title),
                content: labelsToVars($ctrl.template.content),
            }).then(() => {
                $ctrl.previewSent = true;
                PushNotificationsService.success('Success!', 'Please check your email inbox.');
            }, (res) => {
                PushNotificationsService.danger('Error!', res.data.message);
            }).finally(() => {
                $ctrl.submittingToSelf = false;
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.notification = {
            title: "Aanvraag is ontvangen",
            editable: true,
            variables: [
                "fund_name",
                "sponsor_name",
                "webshop_button",
                "email_logo",
                "email_signature"
            ],
            templates_default: [{
                "type": "mail",
                "formal": 0,
                "title": "[fonds_naam] - Subject",
                "content": [
                    "# [fonds_naam]\n[email_logo]", 
                    "",
                    "E-mail content", 
                    "Please adjust the email content",
                    "",
                    "[webshop_knop]", 
                ].join("   \n"),
                "content_html": [
                    "<h1>[fonds_naam]</h1>[email_logo]", 
                    "",
                    "E-mail content", 
                    "Please adjust the email content",
                    "",
                    "[webshop_knop]", 
                ].join("<br />"),
            }],
        };

        $ctrl.fund = $ctrl.funds[0];
        $ctrl.template = $ctrl.notification.templates_default.find((template) => template.type === 'mail');
        $ctrl.template.content_html_sce = $sce.trustAsHtml($ctrl.template.content_html);

        $ctrl.identitiesOnPageChange($ctrl.identitiesFilters);
        $ctrl.updateVariableValues();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        implementation: '<',
    },
    controller: [
        '$sce',
        '$state',
        '$filter',
        'FundService',
        'ModalService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'FundIdentitiesExportService',
        'ImplementationNotificationsService',
        ImplementationNotificationsSendComponent
    ],
    templateUrl: 'assets/tpl/pages/implementation-notifications-send.html'
};