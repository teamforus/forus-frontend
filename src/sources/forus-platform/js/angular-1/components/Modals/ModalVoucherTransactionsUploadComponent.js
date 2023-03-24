const { chunk } = require('lodash');
const isEmpty = require('lodash/isEmpty');

const ModalVoucherTransactionsUploadComponent = function (
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

    $ctrl.changed = false;
    $ctrl.progressBar = 0;
    $ctrl.progressStatus = "";
    $ctrl.uploadedPartly = false;
    $ctrl.hideModal = false;

    const dataChunkSize = 100;
    const maxLinesPerFile = 2500;
    const $translate = $filter('translate')

    const setProgress = function (progress, status) {
        $ctrl.progressBar = progress;

        if (progress < 100) {
            return $ctrl.progressStatus = status || "Aan het uploaden...";
        }

        $ctrl.progressStatus = status || "Klaar!";
    };

    const makeCsvParser = () => {
        const csvParser = function () {
            this.step = 0;
            this.error = false;
            this.uploading = false;

            const setStep = (step) => {
                this.step = step;
            };

            const setUploading = (uploading) => {
                this.uploading = uploading;
            };

            this.selectFile = function (e) {
                e && (e.preventDefault() && e.stopPropagation());

                if (input && input.remove) {
                    input.remove();
                }

                const input = document.createElement('input');

                input.setAttribute("dusk", "inputUpload");
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

            this.defaultNote = function (row) {
                return $translate('transactions.csv.default_note', {
                    ...row,
                    upload_date: moment().format('YYYY-MM-DD'),
                    uploader_email: $rootScope.auth_user?.email || $rootScope.auth_user?.address,
                });
            }

            this.startUploading = function () {
                return $q((resolve) => {
                    const transactions = [...this.data].map((row) => ({ ...row }));

                    setProgress(100, 'Bestand wordt gecontroleerd...');
                    setStep(2);

                    this.startValidationUploadingData(transactions).then(() => {
                        setProgress(0, `Processing transactions from 1 to ${Math.min(transactions.length, dataChunkSize)} from ${transactions.length}`);
                        setUploading(true);
                        $ctrl.changed = true;

                        this.startUploadingData(transactions, (stats) => {
                            const progress = ((stats.chunk * stats.chunkSize) / stats.transactions.length) * 100;
                            const processedFrom = Math.min(stats.chunk * stats.chunkSize + 1, stats.transactions.length);
                            const processedTo = Math.min((stats.chunk + 1) * stats.chunkSize, stats.transactions.length);

                            setProgress(progress, `Processing transactions from ${processedFrom} to ${processedTo} from ${transactions.length}`);
                        }).then((stats) => {
                            resolve({ ...stats, validation: false });
                            setProgress(100);
                        }).finally(() => {
                            setUploading(false);
                        });
                    }, (errors) => {
                        const errorsList = typeof errors === 'string' ? [...transactions.keys()].reduce((list, index) => ({
                            ...list, [`transactions.${index}.amount`]: errors,
                        }), {}) : errors;

                        resolve({ errors: errorsList, success: 0, validation: true, transactions });
                        setStep(1);
                    });
                });
            };

            this.startValidationUploadingData = function (transactions) {
                return $q((resolve, reject) => {
                    TransactionService.storeBatchValidate($ctrl.organization.id, { transactions }).then(
                        (res) => resolve(res),
                        (res) => reject(res.status == 422 ? res.data?.errors : (res.data?.message || 'Onbekende foutmelding.')),
                    );
                });
            };

            this.startUploadingData = function (transactions, onChunk = () => { }) {
                return new Promise((resolve) => {
                    const stats = {
                        chunk: 0,
                        chunkSize: dataChunkSize,
                        chunks: chunk(transactions, dataChunkSize),
                        transactions: transactions,
                        errors: {},
                        success: 0,
                    };

                    const uploadChunk = (data) => {
                        const transformErrors = (errors) => {
                            return Object.keys(errors).reduce((obj, key) => {
                                const errorKey = key.split('.');
                                errorKey[1] = parseInt(errorKey[1]) + (stats.chunk * stats.chunkSize);
                                return { ...obj, [errorKey.join('.')]: errors[key] };
                            }, {});
                        }

                        TransactionService.storeBatch($ctrl.organization.id, { transactions: data }).then((res) => {
                            stats.errors = { ...transformErrors(res.data?.errors || {}), ...stats.errors };
                            stats.success = stats.success += res.data?.created?.length || 0;

                            return stats;
                        }, (res) => {
                            const message = res.status == 422 ? 'Overgeslagen.' : res.data?.message || 'Onbekende foutmelding.';

                            const errors = transformErrors([...data.keys()].reduce((errors, index) => ({
                                ...errors, [`transactions.${index}.amount`]: message,
                            }), {}));

                            return stats.errors = { ...errors, ...stats.errors, ...transformErrors(res.data?.errors || {}) };
                        }).finally(() => {
                            stats.chunk++;
                            onChunk(stats);

                            if (stats.chunk == stats.chunks.length) {
                                return resolve(stats);
                            }

                            uploadChunk(stats.chunks[stats.chunk]);
                        });
                    };

                    uploadChunk(stats.chunks[stats.chunk]);
                });
            };

            this.showInvalidRows = function (errors = {}, transactions = [], validation = false) {
                const items = Object.keys(errors).map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], transactions[keyDataId]];
                }).filter(arr => !isNaN(arr[0])).sort((a, b) => a[0] - b[0]);

                const uniqueRows = items.reduce((arr, item) => {
                    return arr.includes(item[0]) ? arr : [...arr, item[0]];
                }, []);

                const message = [
                    `Voor ${uniqueRows.length} van de ${transactions.length}`,
                    `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                    `bekijk het bestand bij welke rij(en) het mis gaat.`,
                ].join(" ");

                const messageValidation = [
                    `Voor ${uniqueRows.length} van de ${transactions.length} rij(en) `,
                    `in het bestand dat is geïmporteerd zijn fouten gevonden, bekijk de fouten hieronder. `,
                    `Er zijn geen transacties geïmporteerd. Haal de fouten uit het CSV-bestand en probeer het opnieuw.`,
                ].join(" ");

                if (validation) {
                    PushNotificationsService.danger('Waarschuwing', validation ? messageValidation : message);
                }

                ModalService.open('duplicatesPicker', {
                    hero_title: 'Transactie aanmaken mislukt!',
                    hero_subtitle: [validation ? messageValidation : message],
                    enableToggles: false,
                    label_on: "Aanmaken",
                    label_off: "Overslaan",
                    items: items.map((item) => ({ value: `Rij: ${item[0]}: ${item[2]['uid'] || ''} - ${item[1]}` })),
                    onConfirm: () => $timeout(() => $ctrl.hideModal = false, 300),
                    onCancel: () => $timeout(() => $ctrl.hideModal = false, 300),
                }, {
                    onClose: () => $timeout(() => $ctrl.hideModal = false, 300),
                });

                $ctrl.closeModal();
            };

            this.validateFileLocal = function () {
                return $q((resolve) => {
                    if (this.data.length > maxLinesPerFile) {
                        return resolve([
                            `Het bestand mag niet meer dan ${maxLinesPerFile} transacties bevatten.`,
                            `het huidige bestand bevat meer dan ${this.data.length} transacties.`,
                        ].join(' '));
                    }

                    resolve(null)
                });
            };

            this.uploadToServer = function (e) {
                e && (e.preventDefault() && e.stopPropagation());

                this.startUploading().then((stats) => {
                    const { errors, success, transactions, validation } = stats;
                    const errorsCount = Object.keys(errors).length;
                    const hasErrors = errorsCount > 0;
                    const hasSuccess = success > 0;
                    const uploadedPartly = hasErrors && hasSuccess;

                    $ctrl.uploadedPartly = uploadedPartly;

                    setStep(3);

                    if (hasErrors > 0) {
                        this.showInvalidRows(errors, transactions, validation);

                        if (validation) {
                            return;
                        }
                    }

                    if (hasSuccess && !hasErrors) {
                        return PushNotificationsService.success(
                            'Gelukt!',
                            `Alle ${success} rijen uit het bulkbestand zijn geimporteerd.`,
                        );
                    }

                    PushNotificationsService.danger(!hasSuccess ? 'Foutmelding!' : 'Waarschuwing!', [
                        !hasSuccess ? `Alle ${errorsCount}` : `${errorsCount} van ${transactions.length}`,
                        `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                        `bekijk het bestand bij welke rij(en) het mis gaat.`,
                    ].join(" "));
                });
            }

            // process selected file
            this.uploadFile = function (file) {
                if (!file.name.endsWith('.csv')) {
                    return;
                }

                new $q((resolve) => Papa.parse(file, { complete: resolve })).then((res) => {
                    const body = res.data;
                    const header = res.data.shift();

                    // clean empty rows, trim fields and add default note
                    const data = body.filter((row) => !isEmpty(row.filter((col) => !isEmpty(col)))).map((val) => {
                        const row = {};

                        header.forEach((hVal, hKey) => {
                            if (val[hKey] && val[hKey] != '') {
                                row[hVal.trim()] = val[hKey].trim();
                            }
                        });

                        row.note = row.note || this.defaultNote(row);

                        return isEmpty(row) ? false : row;
                    }).filter(row => !!row);

                    this.data = data;
                    this.csvFile = file;

                    this.validateFileLocal().then((error) => {
                        if (error) {
                            return this.error = error;
                        }

                        setStep(1);
                    });

                }, console.error);
            };
        };

        return new csvParser();
    };

    $ctrl.downloadExampleCsv = () => {
        FileService.downloadFile(
            'transaction_upload_sample.csv',
            TransactionService.sampleCsvTransactions(),
        );
    };

    $ctrl.closeModal = () => {
        if ($ctrl.changed) {
            $ctrl.modal.scope.onCreated();
        }

        $ctrl.close();
    }

    $ctrl.init = () => {
        $ctrl.csvParser = makeCsvParser();

        $element.unbind('dragleave').bind('dragleave', function (e) {
            e.preventDefault()
            $element.removeClass('on-dragover');
        });

        $element.unbind('dragenter dragover').bind('dragenter dragover', function (e) {
            e.preventDefault()
            $element.addClass('on-dragover');
        });

        $element.unbind('drop dragdrop').bind('drop dragdrop', function (e) {
            e.preventDefault();
            $element.removeClass('on-dragover');

            $ctrl.csvParser.uploadFile(e.originalEvent.dataTransfer.files[0]);
        });
    };

    $ctrl.reset = function () {
        $ctrl.init();
    };

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.onCreated = $ctrl.modal.scope.onCreated;

        $ctrl.init();
    };
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
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
        ModalVoucherTransactionsUploadComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-transaction-upload.html',
};
