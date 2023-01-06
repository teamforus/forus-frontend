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

    const labelsToVars = ImplementationNotificationsService.labelsToVars;
    const contentToPreview = ImplementationNotificationsService.contentToPreview;
    const makeCustomNotification = ImplementationNotificationsService.makeCustomNotification;

    const targets = [{
        value: "providers_approved",
        name: 'Alleen active aanbieders',
    }, {
        value: "providers_rejected",
        name: 'Alleen geweigerd aanbieders',
    }, {
        value: "providers_all",
        name: 'Alle aanbieders',
    }, {
        value: "all",
        name: 'Alle gebruikers met een actieve voucher',
    }, {
        value: "has_balance",
        name: 'Alle gebruikers die nog budget beschikbaar hebben of een ongebruike reservering en/of aanbiedings voucher',
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
        with_reservations: 1,
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
        $ctrl.updateVariableValues();
        $ctrl.identitiesOnPageChange($ctrl.identitiesFilters);
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

    $ctrl.onError = (res) => {
        PushNotificationsService.danger('Error!', res.data.message);

        if (res.status === 422) {
            $ctrl.errors = res.data.errors;
        }
    }

    $ctrl.submit = () => {
        if ($ctrl.submitting) {
            return false;
        }

        $ctrl.askConfirmation(() => {
            $ctrl.submitting = true;
            PageLoadingBarService.setProgress(0);

            FundService.sendNotification($ctrl.organization.id, $ctrl.fund.id, {
                ...$ctrl.identitiesFilters,
                subject: labelsToVars($ctrl.template.title),
                content: labelsToVars($ctrl.template.content),
            }).then(() => {
                $state.go('implementation-notifications', $ctrl.implementation);

                PushNotificationsService.success(
                    'Gelukt!',
                    'De e-mail zal zo spoedig mogelijk verstuurd worden naar alle gebruikers.',
                    'check',
                    { timeout: 8000 }
                );
            }, (res) => {
                $ctrl.submitting = false;
                $ctrl.onError(res);
            }).finally(() => PageLoadingBarService.setProgress(100));
        });
    };

    $ctrl.sendToMyself = () => {
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
                PushNotificationsService.success('Gelukt!', 'Bekijk de e-mail in je postvak');
            }, (res) => {
                $ctrl.onError(res);
            }).finally(() => {
                $ctrl.submittingToSelf = false;
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.organization.allow_custom_fund_notifications) {
            return $state.go('implementation-notifications', $ctrl.implementation);
        }

        $ctrl.notification = makeCustomNotification('Aanvraag is ontvangen', [
            "<h1>:fund_name</h1>",
            "[email_logo]",
            "<br>",
            "Inhoud van de e-mail",
            "<br>",
            "Verander de inhoud van de e-mail",
            "<br>",
            "<br>",
            ":webshop_button",
        ].join("\n"), '');

        $ctrl.fund = $ctrl.funds[0];
        $ctrl.template = $ctrl.notification.templates_default.find((template) => template.type === 'mail');

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