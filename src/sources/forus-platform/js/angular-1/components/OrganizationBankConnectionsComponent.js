const OrganizationBankConnectionsComponent = function(
    $q,
    $state,
    $stateParams,
    ModalService,
    BankConnectionService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.filters = {
        per_page: 20,
    };

    $ctrl.showErrors = (error) => {
        return $q((resolve) => {
            if (error) {
                PushNotificationsService.danger('Connection failed', {
                    invalid_grant: "The authorization code is invalid or expired.",
                    access_denied: "You declined authorization request.",
                    not_pending: "Connection request already resolved.",
                }[error] || error);
            }

            resolve(!!error);
        });
    }

    $ctrl.showSuccess = (success) => {
        return $q((resolve) => {
            if (success) {
                PushNotificationsService.success('Success!', "Authorization successfully approved.");
            }

            resolve(!!success);
        });
    }

    $ctrl.onRequestError = (res) => {
        PushNotificationsService.danger('Error', res.data.message || 'Something went wrong, please retry later.');
    };

    $ctrl.confirmDangerAction = (title, description, cancelButton = 'Cancel', confirmButton = 'Confirm') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ title, description, cancelButton, confirmButton },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }

    $ctrl.confirmNewConnection = () => {
        return $q((resolve) => $ctrl.fetchActiveBankConnection().then((bankConnection) => {
            return bankConnection ? $ctrl.confirmDangerAction('You already have an active bunq connection!', [
                'You are about to replace your active bunq connection with a new one.',
                'Are you sure you want to continue?',
            ].join("\n")).then(resolve) : resolve(true);
        }));
    }

    $ctrl.confirmConnectionDisabling = () => {
        return $ctrl.confirmDangerAction('Disable your bunq connection!', [
            'You are about to disable your active bunq connection, this may lead to you not being able to payout the providers before you set a new one.',
            'Are you sure you want to continue?'
        ].join("\n"));
    }

    $ctrl.makeConnection = (bank_id) => {
        $ctrl.confirmNewConnection().then((confirmed) => {
            if (confirmed) {
                BankConnectionService.store($ctrl.organization.id, { bank_id }).then((res) => {
                    document.location = res.data.oauth_url;
                }, $ctrl.onRequestError);
            }
        });
    }

    $ctrl.disableConnection = (connection_id) => {
        $ctrl.confirmConnectionDisabling().then((confirmed) => {
            if (confirmed) {
                BankConnectionService.update($ctrl.organization.id, connection_id, { state: 'disabled' }).then((res) => {
                    $ctrl.replaceConnectionModel(res.data.data);
                    $ctrl.$onInit();
                }, $ctrl.onRequestError);
            }
        });
    }

    $ctrl.replaceConnectionModel = (bankConnection) => {
        for (let i = 0; i < $ctrl.bankConnections.data.length; i++) {
            if ($ctrl.bankConnections.data[i].id == bankConnection.id) {
                $ctrl.bankConnections.data[i] = bankConnection;
            }
        }
    };

    $ctrl.clearFlag = (flag) => {
        $state.go($state.$current.name, { [flag]: null }, { reload: true });
    }

    $ctrl.fetchBankConnections = (query) => {
        return BankConnectionService.list($ctrl.organization.id, query);
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchBankConnections(query).then((res) => $ctrl.bankConnections = res.data);
    };

    $ctrl.fetchActiveBankConnection = () => {
        return $ctrl.fetchBankConnections({ state: 'active' }).then((res) => res.data.data[0] || null);
    };

    $ctrl.$onInit = function() {
        $ctrl.showErrors($stateParams.error).then((reload) => reload && $ctrl.clearFlag('error'));
        $ctrl.showSuccess($stateParams.success).then((reload) => reload && $ctrl.clearFlag('success'));

        $ctrl.bank = $ctrl.banks.data.filter(bank => bank.key == 'bunq')[0] || undefined;
        $ctrl.fetchActiveBankConnection().then((bankConnection) => $ctrl.bankConnection = bankConnection);
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