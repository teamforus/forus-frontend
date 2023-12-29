const BIConnectionComponent = function (
    $filter,
    ModalService,
    ClipboardService,
    FormBuilderService,
    BIConnectionService,
    PushNotificationsService
) {

    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.recreate_bi_connection.${key}`);

    $ctrl.tab = 'settings';
    $ctrl.apiUrl = '';
    $ctrl.showInfoBlock = false;
    $ctrl.headerKey = 'X-API-KEY';
    $ctrl.parameterKey = 'api_key';
    $ctrl.ip = '';

    $ctrl.authTypes = [
        { key: 'disabled', name: $translate('bi_connection.labels.disabled') },
        { key: 'header', name: $translate('bi_connection.labels.header') },
        { key: 'parameter', name: $translate('bi_connection.labels.parameter') },
    ];

    $ctrl.expirationPeriods = [
        { key: '24_hour', name: $translate('bi_connection.expiration_periods.24_hour') },
        { key: '1_week', name: $translate('bi_connection.expiration_periods.1_week') },
        { key: '1_month', name: $translate('bi_connection.expiration_periods.1_month') },
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
        ClipboardService.copy(str).then(() => PushNotificationsService.success("Gekopieerd naar het klembord."));
    };

    $ctrl.updateUrl = () => {
        const { auth_type } = $ctrl.form.values;
        const { bi_connection_url } = $ctrl.organization;
        const access_token = $ctrl.connection.access_token || '';

        if (auth_type == 'header') {
            return $ctrl.apiUrl = bi_connection_url;
        }

        if (auth_type == 'parameter') {
            return $ctrl.apiUrl = `${bi_connection_url}?${$ctrl.parameterKey}=${access_token}`;
        }
    }

    $ctrl.resetToken = () => {
        $ctrl.askConfirmation(() => {
            BIConnectionService.resetToken($ctrl.organization.id, $ctrl.connection.id).then((res) => {
                $ctrl.connection = res.data.data;
                $ctrl.initForm();
                $ctrl.updateUrl();
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.updateUrl();
            }, (res) => {
                PushNotificationsService.danger(res.data?.message || 'Foutmelding!');
            });
        });
    };

    $ctrl.addIp = (showError = true) => {
        if ($ctrl.ip !== '' && $ctrl.ip) {
            $ctrl.ips.push({ value: $ctrl.ip });
            $ctrl.ip = '';
            $ctrl.ipError = '';
        } else if (showError) {
            $ctrl.ipError = 'Het IP veld is verplicht.';
            $ctrl.form.errors.ips = []; // remove ip errors from request to prevent duplicate error messages
        }
    };

    $ctrl.removeIp = (index) => {
        $ctrl.ips.splice(index, 1);
    };

    $ctrl.initForm = () => {
        const { data_types, ips } = $ctrl.connection;

        $ctrl.data_types = (data_types || []).reduce((types, type) => ({ ...types, [type]: true }), {});
        $ctrl.ips = (ips || []).reduce((items, ip) => ([ ...items, { value: ip } ]), []);

        const values = $ctrl.connection.id ? BIConnectionService.apiResourceToForm($ctrl.connection) : {
            ips: [],
            auth_type: 'disabled',
            data_types: [],
            expiration_period: '1_month',
        };

        $ctrl.form = FormBuilderService.build(values, (form) => {
            $ctrl.addIp(false);

            const data_types = Object.keys($ctrl.data_types).filter((key) => $ctrl.data_types[key]);
            const ips = $ctrl.ips.map((ip) => ip.value);
            const values = { ...form.values, data_types: data_types, ips: ips };

            const promise = $ctrl.connection.id ? BIConnectionService.update(
                $ctrl.organization.id,
                $ctrl.connection.id,
                values,
            ) : BIConnectionService.store(
                $ctrl.organization.id,
                values,
            );

            promise.then((res) => {
                $ctrl.connection = res.data.data;
                $ctrl.initForm();
                $ctrl.updateUrl();
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                if (form.errors && ((form.errors.data_types?.length) || (form.errors.auth_type?.length))) {
                    $ctrl.tab = 'settings';
                } else {
                    $ctrl.tab = 'security';
                }

                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.loadBIConnection = () => {
        return BIConnectionService.active($ctrl.organization.id).then((res) => $ctrl.connection = res.data.data);
    };

    $ctrl.loadTypes = () => {
        return BIConnectionService.availableDataTypes($ctrl.organization.id).then((res) => {
            $ctrl.available_data_types = res.data.data;

            $ctrl.initForm();
            $ctrl.updateUrl();
        });
    };

    $ctrl.$onInit = function () {
        if (!$ctrl.auth2FAState?.restrictions?.bi_connections?.restricted) {
            $ctrl.loadBIConnection().then($ctrl.loadTypes);
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
        auth2FAState: '<',
    },
    controller: [
        '$filter',
        'ModalService',
        'ClipboardService',
        'FormBuilderService',
        'BIConnectionService',
        'PushNotificationsService',
        BIConnectionComponent,
    ],
    templateUrl: 'assets/tpl/pages/bi-connection.html',
};