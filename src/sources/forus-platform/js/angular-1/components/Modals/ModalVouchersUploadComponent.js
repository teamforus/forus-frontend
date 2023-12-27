const isEmpty = require('lodash/isEmpty');
const groupBy = require('lodash/groupBy');
const countBy = require('lodash/countBy');
const sortBy = require('lodash/sortBy');
const uniq = require('lodash/uniq');
const map = require('lodash/map');

const ModalVouchersUploadComponent = function (
    $q,
    $rootScope,
    $timeout,
    $filter,
    $element,
    FileService,
    ModalService,
    HelperService,
    VoucherService,
    ProductService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.progress = 1;

    $ctrl.changed = false;
    $ctrl.progressBar = 0;
    $ctrl.progressStatus = "";
    $ctrl.productsIds = [];
    $ctrl.hideModal = false;

    let $translate = $filter('translate')
    let input;
    let dataChunkSize = 100;

    let chunk = function (arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }

    let makeCsvParser = () => {
        let csvParser = function () {
            this.progress = 0;
            this.errors = {};

            this.selectFile = function (e) {
                e && (e.preventDefault() & e.stopPropagation());

                if (input && input.remove) {
                    input.remove();
                }

                input = document.createElement('input');
                input.setAttribute("dusk", "inputUpload");
                input.setAttribute("type", "file");
                input.setAttribute("accept", ".csv");
                input.style.display = 'none';

                input.addEventListener('change', (e) => this.uploadFile(e.target.files[0]));

                $element[0].appendChild(input);

                input.click();
            };

            this.defaultNote = function (row) {
                return $translate('vouchers.csv.default_note' + (row.email ? '' : '_no_email'), {
                    upload_date: moment().format('YYYY-MM-DD'),
                    uploader_email: $rootScope.auth_user?.email || $rootScope.auth_user?.address,
                    target_email: row.email || null,
                });
            }

            this.validateCsvData = function (data) {
                const invalidFundIds = data.filter((row) => {
                    const validFormat = row.fund_id && /^\d+$/.test(row.fund_id);
                    const validFund = $ctrl.availableFundsIds.includes(parseInt(row.fund_id));

                    return !validFormat || !validFund;
                }).map((row) => row.fund_id);

                this.errors.hasInvalidFundIds = invalidFundIds.length > 0;
                this.errors.hasInvalidFundIdsList = uniq(invalidFundIds).join(', ');

                if (invalidFundIds.length > 0) {
                    return false;
                }

                if (!$ctrl.organization.bsn_enabled && data.filter((row) => row.bsn).length > 0) {
                    this.errors.csvHasBsnWhileNotAllowed = true;
                    return false;
                }

                if ($ctrl.type == 'fund_voucher') {
                    return this.validateCsvDataBudget(data);
                } else if ($ctrl.type == 'product_voucher') {
                    return this.validateCsvDataProduct(data);
                }

                return false;
            };

            this.validateCsvDataBudget = function (data) {
                const fundBudget = $ctrl.fund.limit_sum_vouchers;
                const csvTotalAmount = data.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);

                if ($ctrl.fund.type === 'budget') {
                    this.errors.csvAmountMissing = data.filter(row => !row.amount).length > 0;

                    // csv total amount should be withing fund budget
                    this.errors.invalidAmountField = csvTotalAmount > fundBudget;

                    // some vouchers exceed the limit per voucher
                    this.errors.invalidPerVoucherAmount = data.filter(
                        row => row.amount > $ctrl.fund.limit_per_voucher
                    ).length > 0;
                }

                // fund vouchers csv shouldn't have product_id field
                this.errors.csvProductIdPresent = data.filter(
                    row => row.product_id != undefined
                ).length > 0;

                return !this.errors.invalidAmountField &&
                    !this.errors.csvProductIdPresent &&
                    !this.errors.csvAmountMissing &&
                    !this.errors.invalidPerVoucherAmount;
            }

            this.validateCsvDataProduct = function (data) {
                let validation = this.validateProductId(data);

                this.errors.csvHasMissingProductId = validation.hasMissingProductId;
                this.errors.csvProductsInvalidStockIds = validation.invalidStockIds;
                this.errors.csvProductsInvalidUnknownIds = validation.invalidProductIds;

                this.errors.csvProductsInvalidStockIdsList = uniq(map(
                    this.errors.csvProductsInvalidStockIds, 'product_id'
                )).join(', ');

                this.errors.csvProductsInvalidUnknownIdsList = uniq(map(
                    this.errors.csvProductsInvalidUnknownIds, 'product_id'
                )).join(', ');

                // product vouchers .csv should not have an `amount` field
                this.errors.hasAmountField = data.filter(row => row.amount != undefined).length > 0;

                return (!this.errors.hasAmountField && !this.errors.csvHasMissingProductId) && validation.isValid;
            }

            this.uploadFile = function (file) {
                if (!file.name.endsWith('.csv')) {
                    return;
                }

                new $q((resolve) => Papa.parse(file, { complete: resolve })).then((res) => {
                    let csvData = this.transformCsvData(res.data);
                    let body = csvData;
                    let header = csvData.shift();

                    let data = body.filter(row => {
                        return row.filter(col => !isEmpty(col)).length > 0;
                    }).map((val) => {
                        let row = {};

                        header.forEach((hVal, hKey) => {
                            if (val[hKey] && val[hKey] != '') {
                                row[hVal.trim()] = typeof val[hKey] === 'object' ? val[hKey] : val[hKey].trim();
                            }
                        });

                        row.note = row.note || this.defaultNote(row);
                        row.fund_id = row.fund_id || $ctrl.fund.id;
                        row.client_uid = row.client_uid || row.activation_code_uid || null;
                        delete row.activation_code_uid;

                        return isEmpty(row) ? false : row;
                    }).filter(row => !!row);

                    this.isValid = this.validateCsvData(data);
                    this.data = data;
                    this.csvFile = file;
                    this.progress = 1;
                }, console.error);
            };

            this.transformCsvData = (rawData) => {
                const header = rawData[0];

                const recordIndexes = header.reduce((list, row, index) => {
                    return row.startsWith('record.') ? [...list, index] : list;
                }, []);

                const body = rawData.slice(1).filter((row) => {
                    return row.filter(col => !isEmpty(col)).length > 0;
                }).map((row) => {
                    const records = recordIndexes.reduce((list, index) => {
                        return { ...list, [header[index].slice('record.'.length)]: row[index] };
                    }, {});

                    const values = row.reduce((list, item, key) => {
                        return recordIndexes.includes(key) ? list : [...list, item];
                    }, []);

                    return [...values, records];
                });

                return [[...header.filter((value, index) => value && !recordIndexes.includes(index)), 'records'], ...body];
            };

            this.validateProductId = function (data = []) {
                let allProductIds = countBy(data, 'product_id')

                let hasMissingProductId = data.filter(row => row.product_id === undefined).length > 0;
                let invalidProductIds = data.filter(row => !$ctrl.productsByIds[row.product_id]);
                let invalidStockIds = data.filter(row => $ctrl.productsByIds[row.product_id]).filter(row => {
                    return !$ctrl.productsByIds[row.product_id].unlimited_stock && (
                        $ctrl.productsByIds[row.product_id].stock_amount < allProductIds[row.product_id]
                    );
                });

                return {
                    isValid: !invalidProductIds.length && !invalidStockIds.length,
                    hasMissingProductId: hasMissingProductId,
                    invalidStockIds: invalidStockIds,
                    invalidProductIds: invalidProductIds,
                };
            };

            this.confirmEmailSkip = function (existingEmails, fund, list) {
                const items = existingEmails.map((email) => ({ value: email, columns: { fund: fund.name } }));

                return $q((resolve, reject) => {
                    if (items.length === 0) {
                        return resolve(list);
                    }

                    ModalService.open('duplicatesPicker', {
                        hero_title: `Dubbele e-mailadressen gedetecteerd voor fond "${fund.name}".`,
                        hero_subtitle: [
                            `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een extra voucher wilt aanmaken?`,
                            "Deze e-mailadressen bezitten al een voucher van dit fonds."
                        ],
                        button_none: "Alle overslaan",
                        button_all: "Alle aanmaken",
                        label_on: "Aanmaken",
                        label_off: "Overslaan",
                        items: items,
                        onConfirm: (items) => {
                            const allowedEmails = items.filter(item => item.model).map(item => item.value);

                            resolve(list.filter((row) => {
                                return !existingEmails.includes(row.email) || allowedEmails.includes(row.email);
                            }));
                        },
                        onCancel: () => reject(`Operation cancelled on fund ${fund.name}.`),
                    });

                });
            };

            this.confirmBsnSkip = function (existingBsn, fund, list) {
                const items = existingBsn.map((bsn) => ({ value: bsn, columns: { fund: fund.name } }));

                return $q((resolve, reject) => {
                    if (items.length === 0) {
                        return resolve(list);
                    }

                    ModalService.open('duplicatesPicker', {
                        hero_title: `Dubbele bsn(s) gedetecteerd voor fond "${fund.name}".`,
                        hero_subtitle: [
                            `Weet u zeker dat u voor ${items.length} bsn(s) een extra voucher wilt aanmaken?`,
                            "Deze bsn(s) bezitten al een voucher van dit fonds."
                        ],
                        button_none: "Alle overslaan",
                        button_all: "Alle aanmaken",
                        label_on: "Aanmaken",
                        label_off: "Overslaan",
                        items: items,
                        onConfirm: (items) => {
                            const allowedBsn = items.filter(item => item.model).map(item => item.value);

                            resolve(list.filter((row) => {
                                return !allowedBsn.includes(row.bsn) || allowedBsn.includes(row.bsn);
                            }));
                        },
                        onCancel: () => reject(`Operation cancelled on fund ${fund.name}.`),
                    });
                });
            };

            this.uploadToServer = function (e) {
                e && (e.preventDefault() & e.stopPropagation());

                if (!this.isValid) {
                    return false;
                }

                $ctrl.loading = true;

                const listByFundId = groupBy(this.data, 'fund_id');
                const listSelected = [];

                const list = Object.keys(listByFundId).map((fund_id) => ({
                    list: listByFundId[fund_id],
                    fund: $ctrl.availableFundsById[fund_id],
                }));

                const promise = list.reduce((chain, { fund, list }) => {
                    $ctrl.hideModal = true;

                    return chain.then(() => this
                        .findDuplicates(fund, list)
                        .then((list) => listSelected.push(...list)));
                }, $q.resolve());

                promise
                    .then(() => {
                        $ctrl.hideModal = false;

                        if (listSelected.length > 0) {
                            return this.startUploading(listSelected, true).then(() => {
                                return this.startUploading(listSelected);
                            });
                        }

                        PushNotificationsService.success('Canceled', "No vouchers were selected.");
                    })
                    .catch(() => {
                        PushNotificationsService.danger('Canceled', "No vouchers were created.");
                    })
                    .finally(() => {
                        $ctrl.setLoadingBarProgress(0);
                        $ctrl.hideModal = false;
                        $ctrl.loading = false;
                    });
            }

            this.findDuplicates = (fund, list) => {
                PushNotificationsService.success(
                    'Wordt verwerkt...',
                    `Bestaande tegoeden voor "${fund.name}" worden verwerkt om te controleren op dubbelingen.`,
                    'download-outline',
                );

                return $q((resolve, reject) => {
                    const fetchVouchers = (page) => {
                        return VoucherService.index($ctrl.organization.id, {
                            fund_id: fund.id,
                            type: $ctrl.type,
                            per_page: 100,
                            page: page,
                            source: 'employee',
                            expired: 0,
                        });
                    };

                    PageLoadingBarService.setProgress(0);

                    HelperService.recursiveLeacher(fetchVouchers, 4).then(async (data) => {
                        PageLoadingBarService.setProgress(100);

                        PushNotificationsService.success(
                            'Aan het vergelijken...',
                            `De tegoeden voor "${fund.name}" zijn ingeladen en worden vergeleken met het .csv bestand...`,
                            'timer-sand',
                        );

                        const emails = data.map((voucher) => voucher.identity_email);
                        const bsnList = [
                            ...data.map((voucher) => voucher.relation_bsn),
                            ...data.map((voucher) => voucher.identity_bsn)
                        ];

                        const existingEmails = list
                            .filter((csvRow) => emails.includes(csvRow.email))
                            .map((csvRow) => csvRow.email);

                        const existingBsn = list
                            .filter((csvRow) => bsnList.includes(csvRow.bsn))
                            .map((csvRow) => csvRow.bsn);

                        if (existingEmails.length === 0 && existingBsn.length === 0) {
                            return resolve(list);
                        }

                        $q.resolve(list)
                            .then((list) => this.confirmEmailSkip(existingEmails, fund, list))
                            .then((list) => this.confirmBsnSkip(existingBsn, fund, list))
                            .then(resolve)
                            .catch(reject);
                    }, () => {
                        PushNotificationsService.danger('Error', 'Er is iets misgegaan bij het ophalen van de tegoeden.');
                        reject();
                        $ctrl.close();
                    });
                });
            }

            this.getStatus = function (fund, validation = false) {
                return validation ? `Validating vouchers for ${fund.name}...` : `Uploading vouchers for ${fund.name}...`;
            };

            this.startUploading = function (data, validation = false) {
                this.progress = 2;

                return $q((resolve) => {
                    const dataGrouped = groupBy(JSON.parse(JSON.stringify(data)).map((row) => ({
                        ...row, fund_id: row.fund_id ? row.fund_id : $ctrl.fund.id,
                    })), 'fund_id');

                    const promise = Object.keys(dataGrouped).reduce((chain, fundId) => {
                        const fund = $ctrl.availableFundsById[fundId];
                        const items = dataGrouped[fund.id].map((item) => {
                            delete item.fund_id;
                            return item;
                        });

                        let totalRows = items.length;
                        let uploadedRows = 0;

                        $ctrl.setLoadingBarProgress(0, this.getStatus(fund, validation));

                        return chain.then(() => {
                            if (validation) {
                                return this
                                    .startValidationUploadingData(fund, items, (chunkData) => {
                                        uploadedRows += chunkData.length;
                                        $ctrl.setLoadingBarProgress((uploadedRows / totalRows) * 100, this.getStatus(fund, true));
                                    })
                                    .then(() => {
                                        $ctrl.setLoadingBarProgress(100, this.getStatus(fund, true));
                                    })
                                    .catch((errors) => {
                                        this.progress = 1;
                                        this.showInvalidRows(errors, items);
                                    });
                            }

                            return this.startUploadingData(fund, items, (chunkData) => {
                                uploadedRows += chunkData.length;
                                $ctrl.setLoadingBarProgress((uploadedRows / totalRows) * 100, this.getStatus(fund, false));

                                if (uploadedRows === totalRows) {
                                    $timeout(() => {
                                        $ctrl.setLoadingBarProgress(100, this.getStatus(fund, false));
                                        this.progress = 3;
                                        $rootScope.$broadcast('vouchers_csv:uploaded', true);
                                    }, 0);
                                }
                            });
                        });
                    }, $q.resolve());

                    promise.then(() => {
                        resolve();
                    });
                });
            };

            this.startValidationUploadingData = function (fund, groupData, onChunk = () => { }) {
                return new Promise((resolve, reject) => {
                    const submitData = chunk(groupData, dataChunkSize);
                    const chunksCount = submitData.length;
                    const errors = {};

                    let currentChunkNth = 0;

                    const resolveIfFinished = () => {
                        if (currentChunkNth == chunksCount) {
                            if (Object.keys(errors).length) {
                                return reject(errors);
                            }

                            resolve(true);
                        } else if (currentChunkNth < chunksCount) {
                            uploadChunk(submitData[currentChunkNth]);
                        }
                    }

                    const uploadChunk = (data) => {
                        VoucherService.storeCollectionValidate($ctrl.organization.id, fund.id, data).then(() => {
                            currentChunkNth++;
                            onChunk(data);
                            resolveIfFinished();
                        }, (res) => {
                            if (res.status == 422 && res.data.errors) {
                                Object.keys(res.data.errors).forEach(function (key) {
                                    const keyData = key.split('.');
                                    keyData[1] = parseInt(keyData[1], 10) + currentChunkNth * dataChunkSize;
                                    errors[keyData.join('.')] = res.data.errors[key];
                                });
                            } else {
                                alert('Onbekende error.');
                            }

                            currentChunkNth++;
                            onChunk(data);

                            resolveIfFinished();
                        });
                    };

                    uploadChunk(submitData[currentChunkNth]);
                });
            };

            this.showInvalidRows = function (errors = {}, vouchers = []) {
                const items = Object.keys(errors).map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], vouchers[keyDataId]];
                }).sort((a, b) => a[0] - b[0]);

                const uniqueRows = items.reduce((arr, item) => {
                    return arr.includes(item[0]) ? arr : [...arr, item[0]];
                }, []);

                const message = [
                    `${uniqueRows.length} van ${vouchers.length}`,
                    `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                    `bekijk het bestand bij welke rij(en) het mis gaat.`,
                ].join(" ");

                PushNotificationsService.danger('Waarschuwing', message);

                $ctrl.hideModal = true;

                ModalService.open('duplicatesPicker', {
                    hero_title: "Er zijn fouten opgetreden bij het importeren van de tegoeden",
                    hero_subtitle: message,
                    enableToggles: false,
                    items: items.map((item) => ({ value: `Rij: ${item[0]}: ${item[2]['email'] || item[2]['bsn'] || ''} - ${item[1]}` })),
                    onConfirm: () => $timeout(() => $ctrl.hideModal = false, 300),
                    onCancel: () => $timeout(() => $ctrl.hideModal = false, 300),
                }, {
                    onClose: () => $timeout(() => $ctrl.hideModal = false, 300),
                });
            };

            this.startUploadingData = function (fund, groupData, onChunk = () => { }) {
                return new Promise((resolve) => {
                    var submitData = chunk(groupData, dataChunkSize);
                    var chunksCount = submitData.length;
                    var currentChunkNth = 0;

                    const uploadChunk = (data) => {
                        $ctrl.changed = true;

                        VoucherService.storeCollection($ctrl.organization.id, fund.id, data).then(() => {
                            currentChunkNth++;
                            onChunk(data);

                            if (currentChunkNth == chunksCount) {
                                resolve(true);
                            } else if (currentChunkNth < chunksCount) {
                                uploadChunk(submitData[currentChunkNth]);
                            }
                        }, (res) => {
                            if (res.status == 422 && res.data.errors) {
                                return PushNotificationsService.danger(
                                    'Het is niet gelukt om het gekozen bestand te verwerken.',
                                    Object.values(res.data.errors).reduce((msg, arr) => msg + arr.join(''), "")
                                );
                            }

                            alert('Onbekende error.');
                        });
                    };

                    uploadChunk(submitData[currentChunkNth]);
                });
            };
        };

        return new csvParser();
    };

    $ctrl.reset = function () {
        $ctrl.init();
    };


    $ctrl.setLoadingBarProgress = function (progress, status = null) {
        // fixes progress bar being updated to late due to digest cycle
        $timeout(() => {
            $ctrl.progressBar = progress;
            $ctrl.progressStatus = status;
        }, 0);
    };

    $ctrl.downloadExampleCsv = () => {
        if ($ctrl.type == 'fund_voucher') {
            FileService.downloadFile(
                'budget_voucher_upload_sample.csv',
                $ctrl.fund.type === 'budget'
                    ? VoucherService.sampleCSVBudgetVoucher($ctrl.fund.end_date)
                    : VoucherService.sampleCSVSubsidiesVoucher($ctrl.fund.end_date)
            );
        } else {
            FileService.downloadFile(
                'product_voucher_upload_sample.csv',
                VoucherService.sampleCSVProductVoucher(
                    $ctrl.productsIds[0] || null,
                    $ctrl.fund.end_date
                )
            );
        }
    };

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

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.type = $ctrl.modal.scope.type || 'fund_voucher';
        $ctrl.availableFunds = $ctrl.modal.scope.organizationFunds;
        $ctrl.availableFundsIds = $ctrl.availableFunds.map((fund) => fund.id);
        $ctrl.availableFundsById = $ctrl.availableFunds.reduce((obj, fund) => ({ ...obj, [fund.id]: fund }), {})

        if ($ctrl.type == 'product_voucher') {
            HelperService.recursiveLeacher((page) => {
                return ProductService.listAll({
                    fund_id: $ctrl.fund.id,
                    page: page,
                    per_page: 1000,
                });
            }, 4).then((data) => {
                $ctrl.products = sortBy(data, 'id');
                $ctrl.productsIds = $ctrl.products.map(product => parseInt(product.id));
                $ctrl.productsByIds = $ctrl.products.reduce((obj, product) => {
                    obj[product.id] = product;
                    return obj;
                }, {});

                $ctrl.init();
            });
        } else {
            $ctrl.init();
        }
    };

    $ctrl.closeModal = () => {
        if ($ctrl.changed) {
            $ctrl.modal.scope.done();
        }

        $ctrl.close();
    }
};

module.exports = {
    bindings: {
        close: '=',
        modal: '=',
    },
    controller: [
        '$q',
        '$rootScope',
        '$timeout',
        '$filter',
        '$element',
        'FileService',
        'ModalService',
        'HelperService',
        'VoucherService',
        'ProductService',
        'PageLoadingBarService',
        'PushNotificationsService',
        ModalVouchersUploadComponent,
    ],
    templateUrl: 'assets/tpl/modals/modal-vouchers-upload.html',
};
