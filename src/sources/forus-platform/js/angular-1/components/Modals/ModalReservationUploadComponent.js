const ModalReservationUploadComponent = function(
    $q,
    $rootScope,
    $filter,
    $element,
    $timeout,
    FileService,
    ModalService,
    ProductReservationService,
    PushNotificationsService
) {
    const $ctrl = this;

    $ctrl.progress = 1;

    $ctrl.changed = false;
    $ctrl.progressBar = 0;
    $ctrl.progressStatus = "";
    $ctrl.productsIds = [];
    $ctrl.uploadedPartly = false;
    $ctrl.hideModel = false;

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
            this.errors = {};

            this.selectFile = function(e) {
                e && (e.preventDefault() & e.stopPropagation());

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
                return $translate('reservations.csv.default_note', {
                    ...row,
                    upload_date: moment().format('YYYY-MM-DD'),
                    uploader_email: $rootScope.auth_user.email,
                });
            }

            this.validateCsvData = function(data) {
                // rows without `product_id` field
                this.errors.csvMissingProductIdFields = data.map(
                    (row, key) => !row.product_id ? (key + 1) : null
                ).filter((row) => row !== null).join(', ');

                // rows without `number` field
                this.errors.csvMissingNumberFields = data.map(
                    (row, key) => !row.number ? (key + 1) : null
                ).filter((row) => row !== null).join(', ');

                // rows without `number` field
                this.errors.csvSampleNumberFields = data.map(
                    (row, key) => row.number === '000000000000' ? (key + 1) : null
                ).filter((row) => row !== null).join(', ');

                return (data.length > 0) && (!this.errors.csvSampleNumberFields &&
                    !this.errors.csvMissingProductIdFields &&
                    !this.errors.csvMissingNumberFields);
            };

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

            this.showInvalidRows = function(errors = {}, reservations = [], validation = false) {
                const items = Object.keys(errors).map(function(key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[keyData.length - 1];

                    return [keyDataId, errors[key], reservations[keyDataId]];
                });

                const count_errors = Object.values(errors).length;

                if (validation) {
                    PushNotificationsService.danger(
                        'Foutmelding!',
                        `Kan geen reserveringen aanmaken voor ${count_errors} rij(en).`,
                    );

                    $ctrl.close();
                } else {
                    $ctrl.hideModel = true;
                }

                ModalService.open('duplicatesPicker', {
                    hero_title: "Reserveringen aanmaken mislukt!",
                    hero_subtitle: [
                        "Voor onderstaande nummers kan een reserveringen worden aangemaakt. Er is geen actief tegoed beschikbaar of het gebruikerslimiet is bereikt.\n" +
                        "Om de reserveringen alsnog aan te maken dient het bestand aangepast en opnieuw aangeboden te worden."
                    ],
                    enableToggles: false,
                    label_on: "Aanmaken",
                    label_off: "Overslaan",
                    items: items.map((item) => ({ value: item[2]['number'] + ' - ' + item[1] })),
                    onConfirm: () => $timeout(() => $ctrl.hideModel = false, 300),
                    onCancel: () => $timeout(() => $ctrl.hideModel = false, 300),
                });

            };

            this.startUploadingData = function(reservations) {
                return new Promise((resolve) => {
                    const data = { reservations };

                    ProductReservationService.storeBatch($ctrl.organization.id, data).then((res) => {
                        const hasErrors = res.data.errors && typeof res.data.errors === 'object';
                        const stats = {
                            success: res.data.reserved.length,
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
                                allFailed ? `Alle ${stats.errors}` : `${stats.errors} van ${reservations.length}`,
                                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                                `bekijk het bestand bij welke rij(en) het mis gaat.`,
                            ].join(" "));


                            this.showInvalidRows(res.data.errors, reservations);
                        }

                        resolve(stats);
                    }, (res) => {
                        if (res.status == 422 && res.data.errors) {
                            this.showInvalidRows(res.data.errors, reservations, true);
                        }
                    });
                });
            };

            this.validateReservations = function() {
                return $q((resolve) => resolve(true));
            };

            this.uploadToServer = function(e) {
                e && (e.preventDefault() & e.stopPropagation());

                this.validateReservations().then(() => {
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
                    const data = body.filter((row) => {
                        return row.filter(col => !_.isEmpty(col)).length > 0;
                    }).map((val) => {
                        const row = {};

                        header.forEach((hVal, hKey) => {
                            if (val[hKey] && val[hKey] != '') {
                                row[hVal.trim()] = val[hKey].trim();
                            }
                        });

                        row.note = row.note || this.defaultNote(row);

                        return _.isEmpty(row) ? false : row;
                    }).filter(row => !!row);

                    this.isValid = this.validateCsvData(data);
                    this.data = data;
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
            'product_reservation_upload_sample.csv',
            ProductReservationService.sampleCsvProductReservations()
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
        'ProductReservationService',
        'PushNotificationsService',
        ModalReservationUploadComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-reservation-upload.html';
    }
};
