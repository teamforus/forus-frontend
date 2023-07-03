const BIConnectionComponent = function (
    $filter,
    ModalService,
    ClipboardService,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService
) {

    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.recreate_bi_connection.${key}`);

    $ctrl.apiUrl = '';
    $ctrl.showInfoBlock = false;
    $ctrl.headerKey = 'X-API-KEY';
    $ctrl.parameterKey = 'api_key';

    $ctrl.authTypes = [
        { key: 'disabled', name: $translate('bi_connection.labels.disabled') },
        { key: 'header', name: $translate('bi_connection.labels.header') },
        { key: 'parameter', name: $translate('bi_connection.labels.parameter') },
    ];

    $ctrl.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $ctrl.copyToClipboard = (str) => {
        ClipboardService.copy(str).then(() => PushNotificationsService.success("Copied to clipboard."));
    };

    $ctrl.updateUrl = () => {
        const { bi_connection_auth_type } = $ctrl.form.values;
        const { bi_connection_token, bi_connection_url } = $ctrl.organization;

        if (bi_connection_auth_type == 'header') {
            return $ctrl.apiUrl = bi_connection_url;
        }


        if (bi_connection_auth_type == 'parameter') {
            return $ctrl.apiUrl = `${bi_connection_url}?${$ctrl.parameterKey}=${bi_connection_token}`;
        }
    }

    $ctrl.resetToken = () => {
        $ctrl.askConfirmation(() => {
            OrganizationService.updateBIConnection($ctrl.organization.id, {
                bi_connection_token_reset: true,
            }).then((res) => {
                $ctrl.organization = res.data.data;
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.updateUrl();
            }, (res) => {
                PushNotificationsService.danger(res.data?.message || 'Error!');
            });
        });
    };

    $ctrl.initForm = () => {
        const { bi_connection_auth_type } = $ctrl.organization;

        $ctrl.form = FormBuilderService.build({
            bi_connection_auth_type,
        }, (form) => {
            OrganizationService.updateBIConnection(
                $ctrl.organization.id,
                form.values,
            ).then((res) => {
                $ctrl.organization = res.data.data;
                $ctrl.initForm();
                $ctrl.updateUrl();
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Unknown error!');
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.$onInit = function () {
        $ctrl.initForm();
        $ctrl.updateUrl();
    };
};

module.exports = {
    bindings: {
        organization: '<',
    },
    controller: [
        '$filter',
        'ModalService',
        'ClipboardService',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        BIConnectionComponent,
    ],
    templateUrl: 'assets/tpl/pages/bi-connection.html',
};