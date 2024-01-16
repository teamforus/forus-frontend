import chunk from "lodash/chunk";

const BIConnectionComponent = function (
    $state,
    $filter,
    $stateParams,
    ModalService,
    ClipboardService,
    FormBuilderService,
    BIConnectionService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.recreate_bi_connection.${key}`);

    $ctrl.viewTypes = ['settings', 'security'];
    $ctrl.viewType = $ctrl.viewTypes.includes($stateParams.view_type) ? $stateParams.view_type : 'settings';

    $ctrl.ip = null;
    $ctrl.apiUrl = '';

    $ctrl.showInfoBlock = false;
    $ctrl.showInfoBlockUrl = false;
    $ctrl.showInfoBlockToken = false;

    $ctrl.headerKey = 'X-API-KEY';
    $ctrl.parameterKey = 'api_key';

    $ctrl.authTypes = [
        { key: 'disabled', name: $translate('bi_connection.labels.disabled') },
        { key: 'header', name: $translate('bi_connection.labels.header') },
        { key: 'parameter', name: $translate('bi_connection.labels.parameter') },
    ];

    $ctrl.expirationPeriods = [
        { dasy: 1, name: $translate('bi_connection.expiration_periods.24_hour') },
        { value: 7, name: $translate('bi_connection.expiration_periods.1_week') },
        { value: 30, name: $translate('bi_connection.expiration_periods.1_month') },
    ];

    $ctrl.setViewType = (view_type) => {
        $ctrl.viewType = view_type;
        $state.go($state.$current.name, { ...$stateParams, view_type }, { location: 'replace' });
    };

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
            BIConnectionService.resetToken($ctrl.organization.id).then((res) => {
                $ctrl.connection = res.data.data;
                $ctrl.updateUrl();
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.updateUrl();
            }, (res) => {
                PushNotificationsService.danger(res.data?.message || 'Foutmelding!');
            });
        });
    };

    $ctrl.addIp = () => {
        if (!$ctrl.ip) {
            return $ctrl.ipError = 'Het IP veld is verplicht.';
        }

        $ctrl.ips.push({ value: $ctrl.ip });
        $ctrl.ip = null;
        $ctrl.ipError = null;
    };

    $ctrl.removeIp = (index) => {
        $ctrl.ips.splice(index, 1);
    };

    $ctrl.initForm = () => {
        const { data_types, ips } = $ctrl.connection;

        $ctrl.data_types = (data_types || []).reduce((types, type) => ({ ...types, [type]: true }), {});
        $ctrl.ips = (ips || []).reduce((items, ip) => ([...items, { value: ip }]), []);

        const values = $ctrl.connection?.id ? {
            auth_type: $ctrl.connection.auth_type,
            expiration_period: $ctrl.connection.expiration_period,
        } : {
            auth_type: 'disabled',
            expiration_period: '1_month',
        };

        $ctrl.form = FormBuilderService.build(values, (form) => {
            const values = {
                ips: $ctrl.ips.map((ip) => ip.value),
                data_types: Object.keys($ctrl.data_types).filter((key) => $ctrl.data_types[key]),
                ...form.values,
            };

            const promise = $ctrl.connection.id ?
                BIConnectionService.update($ctrl.organization.id, values) :
                BIConnectionService.store($ctrl.organization.id, values);

            promise.then((res) => {
                $ctrl.connection = res.data.data;
                $ctrl.updateUrl();

                form.errors = null;
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                const errorKeys = Object.keys(form.errors);

                const hasIpsErrors = errorKeys.filter((key) => key.startsWith('ips')).length > 0;
                const hasAuthTypeErrors = errorKeys.filter((key) => key.startsWith('auth_type')).length > 0;
                const hasDataTypesErrors = errorKeys.filter((key) => key.startsWith('data_types')).length > 0;
                const hasExpirationPeriodErrors = errorKeys.filter((key) => key.startsWith('expiration_period')).length > 0;

                if (hasAuthTypeErrors || hasDataTypesErrors) {
                    $ctrl.setViewType('settings');
                } else if (hasIpsErrors || hasExpirationPeriodErrors) {
                    $ctrl.setViewType('security');
                }

                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => {
                $ctrl.ipError = null;
                form.unlock();
            });
        }, true);
    };

    $ctrl.loadBIConnection = () => {
        return BIConnectionService.active($ctrl.organization.id).then((res) => $ctrl.connection = res.data.data);
    };

    $ctrl.loadTypes = () => {
        return BIConnectionService.availableDataTypes($ctrl.organization.id).then((res) => {
            $ctrl.available_data_types = chunk(res.data.data, 2);
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
        '$state',
        '$filter',
        '$stateParams',
        'ModalService',
        'ClipboardService',
        'FormBuilderService',
        'BIConnectionService',
        'PushNotificationsService',
        BIConnectionComponent,
    ],
    templateUrl: 'assets/tpl/pages/bi-connection.html',
};