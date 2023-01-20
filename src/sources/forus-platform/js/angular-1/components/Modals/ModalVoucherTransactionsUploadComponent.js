const isEmpty = require('lodash/isEmpty');

const ModalVoucherTransactionsUploadComponent = function(
    $q,
    $rootScope,
    $filter,
    $element,
    $timeout,
    FileService,
    ModalService,
    TransactionService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.progress = 1;

    $ctrl.changed = false;
    $ctrl.progressBar = 0;
    $ctrl.progressStatus = "";
    $ctrl.uploadedPartly = false;
    $ctrl.hideModal = false;

    const $translate = $filter('translate')

    const setProgress = function(progress) {
        $ctrl.progressBar = progress;

        if (progress < 100) {
            $ctrl.progressStatus = "Aan het uploaden...";
        } else {
            $ctrl.progressStatus = "Klaar!";
        }
    };

    const makeCsvParser = () => {
        const csvParser = function() {
            this.progress = 0;

            this.selectFile = function(e) {
                e && (e.preventDefault() && e.stopPropagation());

                if (input && input.remove) {
                    input.remove();
                }

                const input = document.createElement('input');

                input.setAttribute("type", "file");
                input.setAttribute("accept", ".csv");
                input.style.display = 'none';

                input.addEventListener('change', (e) => {
                    const files = e.target.files;

                    this.uploadFile(files[0]);
                    input.remove();
                });

                $element[0].appendChild(input);

                input.click();
            };

            this.defaultNote = function(row) {
                return $translate('transactions.csv.default_note', {
                    ...row,
                    upload_date: moment().format('YYYY-MM-DD'),
                    uploader_email: $rootScope.auth_user?.email || $rootScope.auth_user?.address,
                });
            }

            this.startUploading = function() {
                return $q((resolve) => {
                    const data = [...this.data].map((row) => ({ ...row }));

                    this.progress = 2;
                    setProgress(0);

                    this.startUploadingData(data).then((stats) => {
                        resolve(stats);
                        setProgress(100);
                    });
                });
            };

            this.showInvalidRows = function(errors = {}, transactions = [], validation = false) {
                const items = Object.keys(errors).map(function(key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], transactions[keyDataId]];
                }).filter(arr => !isNaN(arr[0])).sort((a, b) => a[0] - b[0]);

                const uniqueRows = items.reduce((arr, item) => {
                    return arr.includes(item[0]) ? arr : [...arr, item[0]];
                }, []);

                const message = [
                    `${uniqueRows.length} van ${transactions.length}`,
                    `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                    `bekijk het bestand bij welke rij(en) het mis gaat.`,
                ].join(" ");

                if (validation) {
                    PushNotificationsService.danger('Waarschuwing', message);
                    $ctrl.close();
                } else {
                    $ctrl.hideModal = true;
                }

                ModalService.open('duplicatesPicker', {
                    hero_title: 'Transactie aanmaken mislukt!',
                    hero_subtitle: [message],
                    enableToggles: false,
                    label_on: "Aanmaken",
                    label_off: "Overslaan",
                    items: items.map((item) => ({ value: `Rij: ${item[0]}: ${item[2]['uid'] || ''} - ${item[1]}` })),
                    onConfirm: () => $timeout(() => $ctrl.hideModal = false, 300),
                    onCancel: () => $timeout(() => $ctrl.hideModal = false, 300),
                }, {
                    onClose: () => $timeout(() => $ctrl.hideModal = false, 300),
                });
            };

            this.startUploadingData = function(transactions) {
                return new Promise((resolve) => {
                    const data = { transactions };

                    TransactionService.storeBatch($ctrl.organization.id, data).then((res) => {
                        const hasErrors = res.data.errors && typeof res.data.errors === 'object';
                        const stats = {
                            success: res.data.created.length,
                            errors: hasErrors ? Object.keys(res.data.errors).length : 0,
                        };

                        if (stats.errors === 0) {
                            PushNotificationsService.success(
                                'Gelukt!',
                                `Alle ${stats.success} rijen uit het bulkbestand zijn geimporteerd.`,
                            );
                        } else {
                            const allFailed = stats.success === 0;

                            PushNotificationsService.danger(allFailed ? 'Foutmelding!' : 'Waarschuwing', [
                                allFailed ? `Alle ${stats.errors}` : `${stats.errors} van ${transactions.length}`,
                                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                                `bekijk het bestand bij welke rij(en) het mis gaat.`,
                            ].join(" "));

                            this.showInvalidRows(res.data.errors, transactions);
                        }

                        resolve(stats);
                    }, (res) => {
                        if (res.status == 422 && res.data.errors) {
                            this.showInvalidRows(res.data.errors, transactions, true);
                        }
                    });
                });
            };

            this.validateTransactions = function() {
                return $q((resolve) => resolve(true));
            };

            this.uploadToServer = function(e) {
                e && (e.preventDefault() && e.stopPropagation());

                this.validateTransactions().then(() => {
                    this.startUploading().then((stats) => {
                        this.progress = 3;
                        $ctrl.uploadedPartly = stats.errors !== 0;

                        if (stats.success > 0) {
                            $ctrl.changed = true;
                        }
                    });
                });
            }

            // process selected file
            this.uploadFile = function(file) {
                if (!file.name.endsWith('.csv')) {
                    return;
                }

                new $q((resolve) => Papa.parse(file, { complete: resolve })).then((res) => {
                    const body = res.data;
                    const header = res.data.shift();

                    // clean empty rows, trim fields and add default note
                    this.data = body.filter((row) => {
                        return row.filter(col => !isEmpty(col)).length > 0;
                    }).map((val) => {
                        const row = {};

                        header.forEach((hVal, hKey) => {
                            if (val[hKey] && val[hKey] != '') {
                                row[hVal.trim()] = val[hKey].trim();
                            }
                        });

                        row.note = row.note || this.defaultNote(row);

                        return isEmpty(row) ? false : row;
                    }).filter(row => !!row);

                    this.csvFile = file;
                    this.progress = 1;
                }, console.error);
            };
        };

        return new csvParser();
    };

    $ctrl.reset = function() {
        $ctrl.init();
    };

    $ctrl.downloadExampleCsv = () => {
        FileService.downloadFile(
            'transaction_upload_sample.csv',
            TransactionService.sampleCsvTransactions()
        );
    };

    $ctrl.init = () => {
        $ctrl.csvParser = makeCsvParser();

        $element.unbind('dragleave').bind('dragleave', function(e) {
            e.preventDefault()
            $element.removeClass('on-dragover');
        });

        $element.unbind('dragenter dragover').bind('dragenter dragover', function(e) {
            e.preventDefault()
            $element.addClass('on-dragover');
        });

        $element.unbind('drop dragdrop').bind('drop dragdrop', function(e) {
            e.preventDefault();
            $element.removeClass('on-dragover');

            $ctrl.csvParser.uploadFile(e.originalEvent.dataTransfer.files[0]);
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;
        $ctrl.init();
    };

    $ctrl.closeModal = () => {
        if ($ctrl.changed) {
            $ctrl.modal.scope.onCreated();
        }

        $ctrl.close();
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$q',
        '$rootScope',
        '$filter',
        '$element',
        '$timeout',
        'FileService',
        'ModalService',
        'TransactionService',
        'PushNotificationsService',
        ModalVoucherTransactionsUploadComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-transaction-upload.html';
    }
};
