const BIConnectionComponent = function (
    $scope,
    $filter,
    ModalService,
    FormBuilderService,
    BIConnectionService,
    PushNotificationsService
) {
    let $translate = $filter('translate');

    const $ctrl = this;
    $ctrl.showInfoBlock = false;
    $ctrl.headerKey = 'X-API-KEY';
    $ctrl.parameterKey = 'api_key';
    $ctrl.apiUrl = '';
    $ctrl.authTypes = [
        {key: 'header', name: $translate('bi_connection.labels.header')},
        {key: 'parameter', name: $translate('bi_connection.labels.parameter')},
    ];

    let $translateDangerZone = (key) => $translate(
        'modals.danger_zone.recreate_bi_connection.' + key
    );

    $ctrl.askConfirmation = (onConfirm) => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: onConfirm
        });
    };

    $ctrl.recreateToken = () => {
        $ctrl.askConfirmation(() => {
            BIConnectionService.recreate($ctrl.organization.id, $ctrl.form.values).then((res) => {
                $ctrl.connection = res.data.data;
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => PushNotificationsService.danger('Error!'));
        });
    };

    $ctrl.initForm = () => {
        let values = BIConnectionService.apiResourceToForm($ctrl.connection || {});

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            form.lock();

            let promise;

            if ($ctrl.connection) {
                promise = BIConnectionService.update(
                    $ctrl.organization.id,
                    $ctrl.connection.id,
                    form.values
                )
            } else {
                promise = BIConnectionService.store(
                    $ctrl.organization.id,
                    form.values
                )
            }

            promise.then((res) => {
                $ctrl.connection = res.data.data;
                PushNotificationsService.success('Opgeslagen!');
                form.unlock();
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };

    $ctrl.buildUrl = () => {
        if ($ctrl.connection) {
            $ctrl.apiUrl = $ctrl.form.values.auth_type === 'header'
                ? $ctrl.connection.url
                : $ctrl.connection.url + '?' + $ctrl.parameterKey + '=' + $ctrl.connection.token;
        }
    }

    $ctrl.copyToClipboard = (str) => {
        const el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        PushNotificationsService.success("Copied to clipboard.");
    };

    $scope.$watch('$ctrl.connection', $ctrl.buildUrl);

    $ctrl.$onInit = function () {
        $ctrl.connection = $ctrl.connections[0];
        $ctrl.initForm();
    };
};

module.exports = {
    bindings: {
        organization: '<',
        connections: '<'
    },
    controller: [
        '$scope',
        '$filter',
        'ModalService',
        'FormBuilderService',
        'BIConnectionService',
        'PushNotificationsService',
        BIConnectionComponent
    ],
    templateUrl: 'assets/tpl/pages/bi-connection.html',
};