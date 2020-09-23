let ModalVouchersUploadComponent = function(
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
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.progress = 1;

    $ctrl.changed = false;
    $ctrl.progressBar = 0;
    $ctrl.progressStatus = "";
    $ctrl.productsIds = [];

    $ctrl.csvParser = {
        progress: 0
    };

    let $translate = $filter('translate')
    let input;
    let dataChunkSize = 100;

    let setProgress = function(progress) {
        $ctrl.progressBar = progress;

        if (progress < 100) {
            $ctrl.progressStatus = "Aan het uploaden...";
        } else {
            $ctrl.progressStatus = "Klaar!";
        }
    };

    let chunk = function(arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }

    $ctrl.getFundBudget = () => {
        return ($ctrl.fund.budget && (
            typeof $ctrl.fund.budget.left != 'undefined'
        )) ? $ctrl.fund.budget.left : 1000000000;
    };

    $ctrl.reset = function() {
        $ctrl.init();
    };

    $ctrl.downloadExampleCsv = () => {
        if ($ctrl.type == 'fund_voucher') {
            FileService.downloadFile(
                'budget_voucher_upload_sample.csv',
                VoucherService.sampleCSVBudgetVoucher($ctrl.fund.end_date)
            );
        } else {
            FileService.downloadFile(
                'product_voucher_upload_sample.csv',
                VoucherService.sampleCSVProuctVoucher(
                    $ctrl.productsIds[0] || null,
                    $ctrl.fund.end_date
                )
            );
        }
    };

    $ctrl.init = (csvRequiredKeys = []) => {
        $ctrl.csvParser = {
            progress: 0
        };

        $ctrl.csvParser.selectFile = function(e) {
            e && (e.preventDefault() & e.stopPropagation());

            if (input && input.remove) {
                input.remove();
            }

            input = document.createElement('input');
            input.setAttribute("type", "file");
            input.setAttribute("accept", ".csv");
            input.style.display = 'none';

            input.addEventListener('change', function(e) {
                $ctrl.csvParser.uploadFile(this.files[0]);
            });

            $element[0].appendChild(input);

            input.click();
        };

        $ctrl.csvParser.validateCsvData = (data) => {
            $ctrl.csvParser.csvIsValid = $ctrl.csvParser.validateData(data);

            if ($ctrl.type == 'fund_voucher') {
                $ctrl.csvParser.amountIsValid = $ctrl.csvParser.validateAmount(data);

                // fund vouchers csv shouldn't have product_id field
                $ctrl.csvParser.csvTypeValid = data.filter(
                    row => row.product_id != undefined
                ).length === 0;

                return $ctrl.csvParser.csvIsValid &&
                    $ctrl.csvParser.amountIsValid &&
                    $ctrl.csvParser.csvTypeValid;
            } else if ($ctrl.type == 'product_voucher') {
                let validation = $ctrl.csvParser.validateProductId(data);

                $ctrl.csvParser.csvHasMissingProductId = validation.hasMissingProductId;
                $ctrl.csvParser.csvProductIdValid = validation.isValid;
                $ctrl.csvParser.csvProductsInvalidStockIds = validation.invalidStockIds;
                $ctrl.csvParser.csvProductsInvalidUnknownIds = validation.invalidProductIds;

                $ctrl.csvParser.csvProductsInvalidStockIdsList = _.unique(_.pluck(
                    $ctrl.csvParser.csvProductsInvalidStockIds, 'product_id'
                )).join(', ');

                $ctrl.csvParser.csvProductsInvalidUnknownIdsList = _.unique(_.pluck(
                    $ctrl.csvParser.csvProductsInvalidUnknownIds, 'product_id'
                )).join(', ');

                // fund vouchers csv shouldn't have amount field
                $ctrl.csvParser.hasAmountField = data.filter(
                    row => row.amount != undefined
                ).length > 0;

                return $ctrl.csvParser.csvIsValid &&
                    !$ctrl.csvParser.hasAmountField &&
                    !$ctrl.csvParser.csvHasMissingProductId &&
                    $ctrl.csvParser.csvProductIdValid;
            }

            return false;
        };

        $ctrl.csvParser.uploadFile = (file) => {
            if (!file.name.endsWith('.csv')) {
                return;
            }

            let defaultNote = row => {
                return $translate(
                    'vouchers.csv.default_note' + (
                        row.email ? '' : '_no_email'
                    ), {
                    upload_date: moment().format('YYYY-MM-DD'),
                    uploader_email: $rootScope.auth_user.primary_email,
                    target_email: row.email || null,
                }
                );
            };

            new $q(function(resolve, reject) {
                Papa.parse(file, {
                    complete: resolve
                });
            }).then(function(results) {
                let body = results.data;
                let header = results.data.shift();
                let data = body.filter(row => {
                    return row.filter(col => !_.isEmpty(col)).length > 0;
                }).map(function(val) {
                    let row = {};

                    header.forEach((hVal, hKey) => {
                        if (val[hKey] && val[hKey] != '') {
                            row[hVal] = val[hKey];
                        }
                    });

                    if (!row.note) {
                        row.note = defaultNote(row);
                    }

                    if (_.isEmpty(row)) {
                        return false;
                    }

                    return row;
                }).filter(row => !!row);

                $ctrl.csvParser.isValid = $ctrl.csvParser.validateCsvData(data);
                $ctrl.csvParser.data = data;
                $ctrl.csvParser.csvFile = file;
                $ctrl.csvParser.progress = 1;
            }, console.error);
        };

        /**
         * Validate csv data
         */
        $ctrl.csvParser.validateData = (data = []) => {
            return data.filter(row => {
                return csvRequiredKeys.filter(
                    key => !Object.keys(row).includes(key)
                ).length !== 0;
            }).length === 0;
        };

        $ctrl.csvParser.validateAmount = (data = []) => {
            return data.reduce(
                (sum, row) => sum + parseFloat(row.amount || 0), 0
            ) <= $ctrl.getFundBudget();
        };

        $ctrl.csvParser.validateProductId = (data = []) => {
            let allProductIds = _.countBy(data, 'product_id')

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

        $ctrl.csvParser.uploadToServer = function(e) {
            e && (e.preventDefault() & e.stopPropagation());

            if (!$ctrl.csvParser.isValid) {
                return false;
            }

            $ctrl.loading = true;

            PushNotificationsService.success(
                'Loading...',
                'Loading existing vouchers to check for duplicates!',
                'download-outline'
            );

            HelperService.recursiveLeacher((page) => {
                return VoucherService.index($ctrl.organization.id, {
                    fund_id: $ctrl.fund.id,
                    type: $ctrl.type,
                    per_page: 100,
                    page: page
                });
            }, 4).then(data => {
                PushNotificationsService.success(
                    'Comparing...',
                    'Vouchers loaded! Comparing with .csv...',
                    'timer-sand'
                );

                let emails = data.map(voucher => voucher.identity_email);
                let existingEmails = $ctrl.csvParser.data.filter(csvRow => {
                    return emails.indexOf(csvRow.email) != -1;
                }).map(csvRow => csvRow.email);

                $ctrl.loading = false;

                if (existingEmails.length === 0) {
                    $ctrl.startUploading();
                } else {
                    let items = existingEmails.map(email => ({
                        value: email,
                    }));

                    ModalService.open('duplicatesPicker', {
                        hero_title: "Dubbele e-mailadressen gedetecteerd.",
                        hero_subtitle: [
                            `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een extra voucher wilt aanmaken?`,
                            "Deze e-mailadressen bezitten al een voucher van dit fonds."
                        ],
                        button_none: "Alle vouchers overslaan",
                        button_all: "Alle vouchers aanmaken",
                        label_on: "Aanmaken voucher",
                        label_off: "Overslaan",
                        items: items,
                        onConfirm: (items) => {
                            let allowedEmails = items.filter(item => item.model).map(item => item.value);

                            $ctrl.csvParser.data = $ctrl.csvParser.data.filter(csvRow => {
                                return existingEmails.indexOf(csvRow.email) === -1 ||
                                    allowedEmails.indexOf(csvRow.email) !== -1;
                            });

                            if ($ctrl.csvParser.data.length > 0) {
                                $ctrl.startUploading();
                            } else {
                                $ctrl.close();
                            }
                        },
                        onCancel: () => $ctrl.close(),
                    });
                }
            }, () => $ctrl.loading = false);
        }

        $ctrl.startUploading = () => {
            $ctrl.csvParser.progress = 2;

            var submitData = chunk(JSON.parse(JSON.stringify(
                $ctrl.csvParser.data
            )), dataChunkSize);

            var chunksCount = submitData.length;
            var currentChunkNth = 0;

            setProgress(0);

            let uploadChunk = function(data) {
                $ctrl.changed = true;

                VoucherService.storeCollection(
                    $ctrl.organization.id,
                    $ctrl.fund.id,
                    data
                ).then(function() {
                    currentChunkNth++;
                    setProgress((currentChunkNth / chunksCount) * 100);

                    if (currentChunkNth == chunksCount) {
                        $timeout(function() {
                            setProgress(100);
                            $ctrl.csvParser.progress = 3;

                            $rootScope.$broadcast('vouchers_csv:uploaded', true);
                        }, 0);
                    } else {
                        uploadChunk(submitData[currentChunkNth]);
                    }
                }, (res) => {
                    if (res.status == 422 && res.data.errors) {
                        return PushNotificationsService.danger('Het is niet gelukt om het gekozen bestand te verwerken.', Object.values(
                            res.data.errors
                        ).reduce((msg, arr) => {
                            return msg + arr.join('');
                        }, ""));
                    }

                    alert('Onbekende error.');
                });
            };

            uploadChunk(submitData[currentChunkNth]);
        };

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

            let file = e.originalEvent.dataTransfer.files[0];

            $ctrl.csvParser.uploadFile(file);
        });
    };

    $ctrl.$onInit = () => {
        $ctrl.organization = $ctrl.modal.scope.organization;
        $ctrl.fund = $ctrl.modal.scope.fund || null;
        $ctrl.type = $ctrl.modal.scope.type || 'fund_voucher';

        if ($ctrl.type == 'product_voucher') {
            HelperService.recursiveLeacher((page) => {
                return ProductService.listAll({
                    fund_id: $ctrl.fund.id,
                    page: page,
                    per_page: 1000,
                });
            }, 4).then((data) => {
                $ctrl.products = _.sortBy(data, 'id');
                $ctrl.productsIds = $ctrl.products.map(product => parseInt(product.id));
                $ctrl.productsByIds = $ctrl.products.reduce((obj, product) => {
                    obj[product.id] = product;
                    return obj;
                }, {});

                $ctrl.init([
                    'product_id'
                ]);
            });
        } else {
            $ctrl.init([
                'amount'
            ]);
        }
    };

    $ctrl.$onDestroy = () => { };
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
        modal: '='
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
        'PushNotificationsService',
        ModalVouchersUploadComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-vouchers-upload.html';
    }
};
