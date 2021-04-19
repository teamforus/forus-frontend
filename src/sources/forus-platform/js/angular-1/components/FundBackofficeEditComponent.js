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
        label: 'Allow regular fund requests.',
    }, {
        value: '0',
        label: 'Show try later message.',
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
                PushNotificationsService.success('Success!', 'The api responded and the authorization seems to work.');
            } else {
                PushNotificationsService.danger('Error!', {
                    0: 'The api responded with code `0`, which most likely means the certificate wrong.',
                    404: 'The api responded with code `404`, please check the api url.',
                    403: 'The api responded with code `403`, which most likely means the token or the certificate wrong.',
                }[res.data.response_code] || `The api responded with code \`${res.data.response_code}\`, please verify the settings.` );
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

                PushNotificationsService.success('Saved!', 'Please test connection to verify your new settings.');
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