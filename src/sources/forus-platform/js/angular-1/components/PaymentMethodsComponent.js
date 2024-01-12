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

    $ctrl.privacy = false;
    $ctrl.showForm = false;
    $ctrl.fetching = false;

    $ctrl.showError = (res, fallbackMessage = 'Onbekende foutmelding!') => {
        res.status === 429
            ? PushNotificationsService.danger(res.data.meta.title, res.data.meta.message)
            : PushNotificationsService.danger('Mislukt!', res.data?.message || fallbackMessage);
    };

    $ctrl.connectMollieAccount = () => {
        MollieConnectionService.connect($ctrl.organization.id).then(
            (res) => document.location.href = res.data.url,
            (res) => $ctrl.showError(res),
        );
    };

    $ctrl.fetchMollieAccount = () => {
        if ($ctrl.fetching) {
            return;
        }

        $ctrl.fetching = true;

        MollieConnectionService.fetch($ctrl.organization.id).then((res) => {
            $ctrl.mollieConnection = res.data.data;
            $ctrl.mapProfiles();
            PushNotificationsService.success('Opgeslagen!');
        }, (res) => {
            $ctrl.showError(res);
        }).finally(() => $ctrl.fetching = false);
    };

    $ctrl.deleteMollieAccount = () => {
        if ($ctrl.fetching) {
            return;
        }

        $ctrl.fetching = true;

        MollieConnectionService.destroy($ctrl.organization.id, $ctrl.mollieConnection.id).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $state.reload();
        }, (res) => {
            $ctrl.showError(res);
            $ctrl.fetching = false;
        });
    };

    $ctrl.askConfirmationDelete = () => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: $ctrl.deleteMollieAccount,
        });
    };

    $ctrl.initForm = (values = { country_code: 'NL' }) => {
        $ctrl.form = FormBuilderService.build({ ...values }, (form) => {
            MollieConnectionService.store(
                $ctrl.organization.id,
                form.values,
            ).then((res) => {
                document.location.href = res.data.url;
            }, (res) => {
                form.errors = res.data.errors;
                $ctrl.showError(res);
            }).finally(() => form.unlock());
        }, true);
    };

    $ctrl.initProfileForm = (values = {}) => {
        $ctrl.form = FormBuilderService.build({ ...values }, (form) => {
            let promise;

            if ($ctrl.mollieConnection.profile_pending) {
                promise = MollieConnectionService.updateProfile(
                    $ctrl.organization.id,
                    $ctrl.mollieConnection.id,
                    $ctrl.mollieConnection.profile_pending.id,
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
                $ctrl.mapProfiles();
                PushNotificationsService.success('Opgeslagen!');
            }, (res) => {
                form.errors = res.data.errors;
                PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
            }).finally(() => form.unlock());
        }, true);
    };

    const getCountryOptions = () => {
        const countryCodes = countries.getNames("en");

        return Object.keys(countryCodes).map((code) => ({ code, name: countryCodes[code] }));
    };

    $ctrl.showSignUpForm = () => {
        $ctrl.countryOptions = getCountryOptions();
        $ctrl.initForm();
        $ctrl.showForm = true;
    };

    $ctrl.mapProfiles = () => {
        if ($ctrl.mollieConnection.id) {
            $ctrl.currentProfile = $ctrl.mollieConnection.profiles.filter((profile) => profile.current)[0];
            $ctrl.current_profile_id = $ctrl.currentProfile?.id;
        }
    };

    $ctrl.updateCurrentProfile = () => {
        MollieConnectionService.setCurrentProfile(
            $ctrl.organization.id,
            $ctrl.mollieConnection.id,
            $ctrl.current_profile_id,
        ).then((res) => {
            $ctrl.mollieConnection = res.data.data;
            $ctrl.mapProfiles();
            PushNotificationsService.success('Opgeslagen!');
        }, (res) => {
            PushNotificationsService.danger(res.data?.message || 'Onbekende foutmelding!');
        });
    };

    $ctrl.$onInit = function () {
        if ($ctrl.mollieConnection.id && !$ctrl.mollieConnection.profile_active) {
            $ctrl.initProfileForm($ctrl.mollieConnection.profile_pending || {});
        }

        $ctrl.mapProfiles();
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