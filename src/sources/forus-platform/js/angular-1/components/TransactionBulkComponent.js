const TransactionBulkComponent = function (
    $q,
    $state,
    $stateParams,
    $filter,
    appConfigs,
    FileService,
    ModalService,
    TransactionService,
    LocalStorageService,
    TransactionBulkService,
    TransactionsExportService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.resettingBulk = false;

    $ctrl.paginationStorageKey = 'transaction_bulk_per_page';

    $ctrl.filters = {
        values: {
            per_page: LocalStorageService.getCollectionItem('pagination', $ctrl.paginationStorageKey, 15),
            order_by: 'created_at',
            order_dir: 'desc',
        },
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
                "Weet u zeker dat u de bulk opnieuw wilt instellen?",
                "Stel alleen de bulk opnieuw in als de link om te autoriseren niet meer geldig is.",
                "Alleen de bulk betalingen die nog niet geautoriseerd zijn kunnen opnieuw worden ingesteld.\n\n",
                'U wordt doorverwezen naar de betalingsverkeer pagina van de BNG.\n',
                'Weet u zeker dat u door wil gaan?',
            ].join(" "));
        }
    }

    $ctrl.confirmSubmitToBNG = () => {
        return $ctrl.confirmDangerAction('Betalingsverkeer via de BNG', [
            'U wordt doorverwezen naar de betalingsverkeer pagina van de BNG.\n',
            'Weet u zeker dat u door wil gaan?',
        ].join(" "));
    }

    $ctrl.confirmExport = () => {
        return $ctrl.confirmDangerAction('Exporteer SEPA bestand', [
            'Weet u zeker dat u het bestand wilt exporteren?',
        ].join(" "));
    }

    $ctrl.confirmSetPaidExport = () => {
        return $ctrl.confirmDangerAction('Markeer bulk lijst als betaald', [
            'Bevestig dat de bulk lijst is betaald.\n',
            'Betalingen via het SEPA bestand vinden niet (automatisch) via het systeem plaats.',
            'Het is uw verantwoordelijkheid om de betaling te verwerken middels de SEPA export.',
        ].join(" "));
    }

    $ctrl.onError = (res = null) => {
        PushNotificationsService.danger('Mislukt!', res && res?.data?.message ? res.data.message : 'Er ging iets mis!')
    };

    $ctrl.resetPaymentRequest = (transactionBulk) => {
        const bank = transactionBulk.bank;

        $ctrl.confirmReset(bank).then((confirmed) => {
            if (!confirmed) {
                return;
            }

            $ctrl.resettingBulk = true;
            PageLoadingBarService.setProgress(0);

            TransactionBulkService.reset($ctrl.organization.id, transactionBulk.id).then((res) => {
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

            TransactionBulkService.submit($ctrl.organization.id, transactionBulk.id).then((res) => {
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
            PushNotificationsService.success('Succes!', 'De bulk is bevestigd!');
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

    $ctrl.exportTransactions = () => {
        TransactionsExportService.export($ctrl.organization.id, {
            ...$ctrl.filters.values, per_page: undefined,
        });
    };

    $ctrl.exportSepa = (transactionBulk) => {
        $ctrl.confirmExport().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            PageLoadingBarService.setProgress(0);

            TransactionBulkService.exportSepa($ctrl.organization.id, transactionBulk.id).then((res) => {
                const date = moment().format('YYYY-MM-DD HH:mm:ss') + '.xml';
                const fileName = [appConfigs.panel_type, $ctrl.organization.id, transactionBulk.id, date].join('_');

                FileService.downloadFile(fileName, res.data, res.headers('Content-Type') + ';charset=utf-8;');
                $state.reload();
            }, (res) => {
                PushNotificationsService.danger('Error!', res && res?.data?.message ? res.data.message : 'Er ging iets mis!')
            }).finally(() => PageLoadingBarService.setProgress(100));
        });
    };

    $ctrl.acceptManually = (transactionBulk) => {
        $ctrl.confirmSetPaidExport().then((confirmed) => {
            if (!confirmed) {
                return;
            }

            PageLoadingBarService.setProgress(0);

            TransactionBulkService.acceptManually($ctrl.organization.id, transactionBulk.id).then(res => {
                PushNotificationsService.success(`Succes!`, `De bulk lijst is handmatig geaccepteerd.`);
                $state.reload();
            }, (res) => {
                PushNotificationsService.danger('Mislukt!', res && res?.data?.message ? res.data.message : 'Er ging iets mis!')
            }).finally(() => PageLoadingBarService.setProgress(100));
        });
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

        if (hasPermission && bulk.bank.key === 'bng' && bulk.state == 'draft') {
            $ctrl.showExportButton = $ctrl.organization.allow_manual_bulk_processing;
        }

        if (hasPermission && bulk.bank.key === 'bng' && bulk.is_exported && bulk.state == 'draft') {
            $ctrl.showSetPaidButton = $ctrl.organization.allow_manual_bulk_processing;
        }

        if (hasPermission && bulk.bank.key === 'bng' && $ctrl.transactionBulk.state == 'accepted') {
            $ctrl.showAcceptType = $ctrl.organization.allow_manual_bulk_processing;
        }
    }

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.filters.values.voucher_transaction_bulk_id = $ctrl.transactionBulk.id;

        $ctrl.onPageChange($ctrl.filters.values);
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
        'FileService',
        'ModalService',
        'TransactionService',
        'LocalStorageService',
        'TransactionBulkService',
        'TransactionsExportService',
        'PageLoadingBarService',
        'PushNotificationsService',
        TransactionBulkComponent
    ],
    templateUrl: 'assets/tpl/pages/transaction-bulk.html'
};