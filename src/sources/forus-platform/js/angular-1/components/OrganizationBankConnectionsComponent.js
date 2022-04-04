const OrganizationBankConnectionsComponent = function(
    $q,
    $state,
    $stateParams,
    ModalService,
    BankConnectionService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.submittingConnection = false;

    $ctrl.filters = {
        per_page: 20,
    };

    $ctrl.onRequestError = (res) => {
        PushNotificationsService.danger('Error', res.data.message || 'Er is iets misgegaan, probeer het later opnieuw.');
    };

    $ctrl.confirmDangerAction = (header, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ header, description_text, cancelButton, confirmButton },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    };

    $ctrl.switchMonetaryAccount = (bankConnection) => {
        const onClose = () => {
            $ctrl.updateActiveBankConnection();
            $ctrl.onPageChange($ctrl.filters);
        }

        ModalService.open('switchBankConnectionAccount', { bankConnection }, { onClose });
    };

    $ctrl.confirmNewConnection = () => {
        return $q((resolve) => $ctrl.fetchActiveBankConnection().then((bankConnection) => {
            return bankConnection ? $ctrl.confirmDangerAction('U heeft al een actieve verbinding met uw bank', [
                'U staat op het punt om opnieuw toestemming te geven en daarmee de verbinding opnieuw tot stand te brengen.',
                'Weet u zeker dat u verder wilt gaan?',
            ].join("\n")).then(resolve) : resolve(true);
        }));
    };

    $ctrl.confirmConnectionDisabling = () => {
        return $ctrl.confirmDangerAction('Verbinding met uw bank stopzetten', [
            'U staat op het punt om de verbinding vanuit Forus met uw bank stop te zetten. Hierdoor stopt Forus met het uitlezen van de rekeninginformatie en het initiëren van transacties.',
            'Weet u zeker dat u verder wilt gaan?'
        ].join("\n"));
    };

    $ctrl.disableConnection = (connection_id) => {
        $ctrl.confirmConnectionDisabling().then((confirmed) => {
            if (confirmed) {
                BankConnectionService.update($ctrl.organization.id, connection_id, { state: 'disabled' }).then((res) => {
                    $ctrl.replaceConnectionModel(res.data.data);
                    $ctrl.$onInit();
                }, $ctrl.onRequestError);
            }
        });
    };

    $ctrl.replaceConnectionModel = (bankConnection) => {
        for (let i = 0; i < $ctrl.bankConnections.data.length; i++) {
            if ($ctrl.bankConnections.data[i].id == bankConnection.id) {
                $ctrl.bankConnections.data[i] = bankConnection;
            }
        }
    };

    $ctrl.clearFlags = (flags) => {
        const params = flags.reduce((params, flag) => {
            return { ...params, [flag]: null };
        }, { ...$stateParams });

        $state.go($state.$current.name, params, { reload: true });
    }

    $ctrl.showStatePush = (success, error) => {
        if (success === true) {
            PushNotificationsService.success('Succes!', "De verbinding met bank is tot stand gebracht.");
        }

        if (error) {
            if (error) {
                PushNotificationsService.danger('Verbinding mislukt', {
                    invalid_grant: "De autorisatiecode is ongeldig of verlopen.",
                    access_denied: "Het autorisatieverzoek is geweigerd.",
                    not_pending: "Verzoek voor verbinding is al behandeld.",
                }[error] || error);
            }
        }

        if ((success === true) || error) {
            $ctrl.clearFlags(['success', 'error']);
        }
    };

    $ctrl.fetchBankConnections = (query) => {
        return BankConnectionService.list($ctrl.organization.id, query);
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchBankConnections(query).then((res) => $ctrl.bankConnections = res.data);
    };

    $ctrl.fetchActiveBankConnection = () => {
        return $ctrl.fetchBankConnections({ state: 'active' }).then((res) => res.data.data[0] || null);
    };

    $ctrl.updateActiveBankConnection = () => {
        return $q((resolve) => {
            $ctrl.fetchActiveBankConnection().then((bankConnection) => {
                $ctrl.bankConnection = bankConnection;
                resolve(bankConnection);
            }, () => resolve(false));
        });
    };

    $ctrl.selectBank = (bankName) => {
        $ctrl.bank = $ctrl.banks.data.filter(bank => bank.key == bankName)[0] || undefined;
    };

    $ctrl.makeBankConnection = (bank) => {
        if ($ctrl.submittingConnection) {
            return;
        }

        $ctrl.submittingConnection = true;

        $ctrl.confirmNewConnection().then((confirmed) => {
            const values = { bank_id: bank.id };

            if (!confirmed) {
                return $ctrl.submittingConnection = false;
            }

            BankConnectionService.store($ctrl.organization.id, values).then((res) => {
                const { auth_url, state } = res.data.data;

                if (state === 'pending' && auth_url) {
                    return document.location = auth_url;
                }

                PushNotificationsService.danger('Error!', 'Er is een onbekende fout opgetreden.');
            }, (res) => {
                $ctrl.submittingConnection = false;
                $ctrl.onRequestError(res);
            });
        });
    }

    $ctrl.$onInit = function() {
        $ctrl.bank = false;

        $ctrl.showStatePush($stateParams.success, $stateParams.error);
        $ctrl.updateActiveBankConnection().then((connection) => {
            $ctrl.bank = connection ? connection.bank : false;
        });
    };
};

module.exports = {
    bindings: {
        banks: '<',
        organization: '<',
        bankConnections: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'ModalService',
        'BankConnectionService',
        'PushNotificationsService',
        OrganizationBankConnectionsComponent
    ],
    templateUrl: 'assets/tpl/pages/organization-bank-connections.html'
};