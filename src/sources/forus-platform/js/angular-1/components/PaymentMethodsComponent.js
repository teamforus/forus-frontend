const countries = require('i18n-iso-countries');
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const PaymentMethodsComponent = function (
    $state,
    $filter,
    ModalService,
    FormBuilderService,
    MollieConnectionService,
    PushNotificationsService
) {
    const $ctrl = this;
    const $translate = $filter('translate');
    const $translateDangerZone = (key) => $translate(`modals.danger_zone.remove_mollie_connection.${key}`);
    $ctrl.fetching = false;
    $ctrl.privacy = false;
    $ctrl.showForm = false;

    $ctrl.connectMollieAccount = () => {
        MollieConnectionService.connect($ctrl.organization.id)
            .then((res) => document.location.href = res.data.url);
    };

    $ctrl.fetchMollieAccount = () => {
        if ($ctrl.fetching) {
            return;
        }

        $ctrl.fetching = true;

        MollieConnectionService.fetch($ctrl.organization.id).then((res) => {
            $ctrl.mollieConnection = res.data.data;
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fetching = false;
        }, (res) => {
            res.status === 429
                ? PushNotificationsService.danger(res.data.meta.title, res.data.meta.message)
                : PushNotificationsService.danger('Error!', res.data?.message || 'Onbekende foutmelding!');

            $ctrl.fetching = false;
        });
    };

    $ctrl.askConfirmationDelete = () => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: deleteMollieAccount
        });
    };

    const deleteMollieAccount = () => {
        if ($ctrl.fetching) {
            return;
        }

        $ctrl.fetching = true;

        MollieConnectionService.destroy($ctrl.organization.id, $ctrl.mollieConnection.id).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            return $state.go('home');
        }, (res) => {
            PushNotificationsService.danger('Error!', res.data?.message || 'Onbekende foutmelding!');
            $ctrl.fetching = false;
        });
    };

    $ctrl.initForm = (values = {}) => {
        $ctrl.form = FormBuilderService.build({ ...values }, (form) => {
            MollieConnectionService.store(
                $ctrl.organization.id,
                form.values,
            ).then((res) => {
                document.location.href = res.data.url;
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.initProfileForm = (values = {}) => {
        $ctrl.form = FormBuilderService.build({ ...values }, (form) => {
            let promise;

            if ($ctrl.mollieConnection.pending_profile) {
                promise = MollieConnectionService.updateProfile(
                    $ctrl.organization.id,
                    $ctrl.mollieConnection.id,
                    $ctrl.mollieConnection.pending_profile.id,
                    form.values,
                );
            } else {
                promise = MollieConnectionService.storeProfile(
                    $ctrl.organization.id,
                    $ctrl.mollieConnection.id,
                    form.values,
                );
            }

            promise.then((res) => {
                $ctrl.mollieConnection = res.data.data;
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };

    const getCountryOptions = () => {
        const countryCodes = countries.getNames("en");

        return Object.keys(countryCodes).map((code) => {
            return {
                code: code,
                name: countryCodes[code],
            };
        });
    };

    $ctrl.showSignUpForm = () => {
        $ctrl.countryOptions = getCountryOptions();
        $ctrl.initForm({
            country_code: 'NL',
        });
        $ctrl.showForm = true;
    };

    $ctrl.$onInit = function () {
        if ($ctrl.mollieConnection.id && !$ctrl.mollieConnection.active_profile) {
            $ctrl.initProfileForm($ctrl.mollieConnection.pending_profile || {});
        }
    };
};

module.exports = {
    bindings: {
        organization: '<',
        mollieConnection: '<',
    },
    controller: [
        '$state',
        '$filter',
        'ModalService',
        'FormBuilderService',
        'MollieConnectionService',
        'PushNotificationsService',
        PaymentMethodsComponent,
    ],
    templateUrl: 'assets/tpl/pages/payment-methods.html',
};