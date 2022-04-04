const TransactionBulkComponent = function(
    $q,
    $state,
    $stateParams,
    $filter,
    appConfigs,
    ModalService,
    TransactionService,
    PageLoadingBarService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.resettingBulk = false;

    $ctrl.filters = {
        per_page: 20,
    };

    $ctrl.confirmDangerAction = (title, description, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
        return $q((resolve) => {
            const onConfirm = () => resolve(true);
            const onCancel = () => resolve(false);
            const params = { title, description, cancelButton, confirmButton, onConfirm, onCancel };

            ModalService.open("dangerZone", { ...params, text_align: 'center' });
        });
    }

    $ctrl.confirmReset = (bank) => {
        if (bank.key === 'bunq') {
            // Reset Bunq bulk confirmation
            return $ctrl.confirmDangerAction('Bulktransactie opnieuw versturen', [
                "U staat op het punt om een bulktransactie opnieuw te versturen.",
                "De vorige bulkbetaling was geannuleerd.",
                "Het opnieuw versturen stelt de bulktransactie opnieuw in en stuurt de transactie naar uw mobiele app.\n",
                "Weet u zeker dat u wilt verdergaan?",
            ].join(" "));
        }

        if (bank.key === 'bng') {
            // Reset BNG bulk confirmation
            return $ctrl.confirmDangerAction('Reset BNG bulk', [
                "You are about to reset your bulk.",
                "Reset bulk only if the existing auth link expired, otherwise please use the existing link.",
                "You can reset only bulks which are not approved yet.\n\n",
                'You will get redirected to BNG confirmation page.\n',
                'Are you sure you want to continue?',
            ].join(" "));
        }
    }

    $ctrl.confirmSubmitToBNG = () => {
        return $ctrl.confirmDangerAction('Submit to BNG', [
            'You will get redirected to BNG confirmation page.\n',
            'Are you sure you want to continue?',
        ].join(" "));
    }

    $ctrl.onError = (res = null) => {
        PushNotificationsService.danger('Error!', res && res?.data?.message ? res.data.message : 'Er ging iets mis!')
    };

    $ctrl.resetPaymentRequest = (transactionBulk) => {
        const bank = transactionBulk.bank;

        $ctrl.confirmReset(bank).then((confirmed) => {
            if (!confirmed) {
                return;
            }

            $ctrl.resettingBulk = true;
            PageLoadingBarService.setProgress(0);

            TransactionService.bulkReset($ctrl.organization.id, transactionBulk.id).then((res) => {
                if (bank.key === 'bunq') {
                    PushNotificationsService.success(`Succes!`, `Accepteer de transacties via uw bank.`);
                }

                if (bank.key === 'bng') {
                    document.location = res.data.data.auth_url;
                }
            }, (res) => {
                $ctrl.onError(res);
            }).finally(() => {
                $ctrl.resettingBulk = false;
                $state.reload();
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.submitPaymentRequestToBNG = (transactionBulk) => {
        $ctrl.confirmSubmitToBNG().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            $ctrl.submittingBulk = true;
            PageLoadingBarService.setProgress(0);

            TransactionService.bulkSubmit($ctrl.organization.id, transactionBulk.id).then((res) => {
                if (res.data.data.auth_url) {
                    return document.location = res.data.data.auth_url;
                }

                $ctrl.onError(res);
            }, (res) => {
                $ctrl.onError(res);
            }).finally(() => {
                $ctrl.submittingBulk = false;
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.fetchTransactions = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            TransactionService.list(appConfigs.panel_type, $ctrl.organization.id, query).then(resolve, reject);
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchTransactions(query).then((res => {
            const data = res.data.data.map((transaction) => {
                const ui_sref = ({
                    address: transaction.address,
                    organization_id: $ctrl.organization.id,
                });

                return { ...transaction, ui_sref };
            });

            $ctrl.transactions = { ...res.data, data };
            $ctrl.transactionsTotal = res.data.meta.total_amount;
        }));
    };

    $ctrl.clearFlags = (flags) => {
        const params = flags.reduce((params, flag) => {
            return { ...params, [flag]: null };
        }, { ...$stateParams });

        $state.go($state.$current.name, params, { reload: true });
    }

    $ctrl.showStatePush = (success, error) => {
        if (success === true) {
            PushNotificationsService.success('Success!', 'Bulk successfully submitted!');
        }

        if (error) {
            PushNotificationsService.danger('Error!', {
                canceled: "Geannuleerd.",
                unknown: "Er is iets misgegaan!",
            }[error] || error);
        }

        if ((success === true) || error) {
            $ctrl.clearFlags(['success', 'error']);
        }
    };

    $ctrl.updateFlags = () => {
        const bulk = $ctrl.transactionBulk;
        const hasPermission = $filter('hasPerm')($ctrl.organization, 'manage_transaction_bulks');

        $ctrl.showAuthLink = false;
        $ctrl.showSubmitToBNG = false;
        $ctrl.showResetBulkButton = false;

        if (hasPermission && (bulk.state === 'pending') && (bulk.bank.key === 'bng') && bulk.auth_url) {
            $ctrl.showAuthLink = true;
        }

        if (hasPermission && bulk.bank.key === 'bng' && bulk.state == 'draft') {
            $ctrl.showSubmitToBNG = true;
        }

        if (hasPermission && bulk.bank.key === 'bng' && bulk.state == 'pending') {
            $ctrl.showResetBulkButton = true;
        }

        if (hasPermission && bulk.bank.key === 'bunq' && bulk.state == 'rejected') {
            $ctrl.showResetBulkButton = true;
        }
    }

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.filters.voucher_transaction_bulk_id = $ctrl.transactionBulk.id;

        $ctrl.onPageChange($ctrl.filters);
        $ctrl.updateFlags();

        $ctrl.showStatePush($stateParams.success, $stateParams.error);
    };
};

module.exports = {
    bindings: {
        organization: '<',
        transactionBulk: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$filter',
        'appConfigs',
        'ModalService',
        'TransactionService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionBulkComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction-bulk.html'
};