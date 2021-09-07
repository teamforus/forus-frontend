let FundBackofficeEditComponent = function(
    $q,
    $element,
    FundService,
    FormBuilderService,
    PushNotificationsService
) {
    let input = false;

    const $ctrl = this;

    $ctrl.isDirty = false;
    $ctrl.isConfigured = false;

    $ctrl.updateIsConfigured = (fund) => {
        $ctrl.isConfigured = fund.backoffice && (
            fund.backoffice.backoffice_url &&
            fund.backoffice.backoffice_key &&
            fund.backoffice.backoffice_certificate
        );
    };

    $ctrl.fallbackOptions = [{
        value: '1',
        label: 'Geen foutmelding',
    }, {
        value: '0',
        label: 'Foutmelding bij API downtime',
    }];

    $ctrl.selectCertificateFile = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (input && input.remove) {
            input.remove();
        }

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", ".pem");
        input.style.display = 'none';

        input.addEventListener('change', function(e) {
            $q((resolve, reject) => {
                const reader = new FileReader()

                reader.onload = event => resolve(event.target.result);
                reader.onerror = error => reject(error);
                reader.readAsText(e.target.files[0]);
            }).then((certificate) => {
                $ctrl.form.values.backoffice_certificate = certificate;
            }, console.error);
        });

        $element[0].appendChild(input);

        input.click();
    };

    $ctrl.makeFormValues = (fund) => {
        const data = {
            ...{
                backoffice_enabled: false,
                backoffice_url: '',
                backoffice_key: '',
                backoffice_certificate: '',
                backoffice_fallback: true,
            }, ...fund.backoffice
        };

        $ctrl.isDirty = false;

        return {
            ...data, ...{
                backoffice_enabled: !!data.backoffice_enabled,
                backoffice_fallback: data.backoffice_fallback ? '1' : '0',
            }
        };
    };

    $ctrl.testBackofficeConnection = () => {
        FundService.backofficeTest($ctrl.organization.id, $ctrl.fund.id).then((res) => {
            if (res.data.state === 'success') {
                PushNotificationsService.success('Succes!', 'De API reageert zonder error codes en de authenticatie werkt.');
            } else {
                PushNotificationsService.danger('Error!', {
                    0: 'De API geeft code `0` terug, wat vaak betekent dat het certificaat verkeerd is.',
                    404: 'De API geeft code `404` terug, controleer de api url.',
                    403: 'De API geeft code `403` terug, wat vaak betekent dat het certificaat of de sleutel verkeerd is.',
                }[res.data.response_code] || `De api geeft code \`${res.data.response_code}\` terug, controleer de instellingen.` );
            }
        }, console.error);
    };

    $ctrl.onChange = () => {
        $ctrl.isDirty = true;
    };

    $ctrl.$onInit = () => {
        $ctrl.updateIsConfigured($ctrl.fund);

        $ctrl.form = FormBuilderService.build(this.makeFormValues($ctrl.fund), (form) => {
            const values = {
                ...form.values, ...{
                    backoffice_enabled: form.values.backoffice_enabled ? 1 : 0,
                }
            };

            FundService.backofficeUpdate($ctrl.organization.id, $ctrl.fund.id, values).then((res) => {
                $ctrl.fund = res.data.data;
                $ctrl.updateIsConfigured($ctrl.fund);

                form.unlock();
                form.values = this.makeFormValues($ctrl.fund);

                PushNotificationsService.success('Opgeslagen!', 'Controleer de integratie om de instellingen te testen.');
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        fund: '<',
        organization: '<',
    },
    controller: [
        '$q',
        '$element',
        'FundService',
        'FormBuilderService',
        'PushNotificationsService',
        FundBackofficeEditComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-backoffice-edit.html'
};