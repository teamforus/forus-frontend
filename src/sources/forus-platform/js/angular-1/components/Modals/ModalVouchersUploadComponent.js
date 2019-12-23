let ModalVouchersUploadComponent = function(
    $q,
    $rootScope,
    $timeout,
    $filter,
    $element,
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

            if ($ctrl.type == 'voucher') {
                $ctrl.csvParser.amountIsValid = $ctrl.csvParser.validateAmount(data);
                return $ctrl.csvParser.csvIsValid && $ctrl.csvParser.amountIsValid;
            } else if ($ctrl.type == 'product_voucher') {
                $ctrl.csvParser.csvProductIdValid = $ctrl.csvParser.validateProductId(data);
                return $ctrl.csvParser.csvIsValid && $ctrl.csvParser.csvProductIdValid;
            }

            return false;
        };

        $ctrl.csvParser.uploadFile = (file) => {
            if (file.name.indexOf('.csv') != file.name.length - 4) {
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
            return data.map(row => {
                return row.product_id && ($ctrl.productsIds.indexOf(
                    parseInt(row.product_id)
                ) != -1);
            }).filter(row => !row).length == 0;
        };

        $ctrl.csvParser.uploadToServer = function(e) {
            e && (e.preventDefault() & e.stopPropagation());

            if (!$ctrl.csvParser.isValid) {
                return false;
            }

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
        }

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
        $ctrl.type = $ctrl.modal.scope.type || 'voucher';

        if ($ctrl.type == 'product_voucher') {
            ProductService.listAll({
                fund_id: $ctrl.fund.id
            }).then((res) => {
                $ctrl.products = res.data.data;
                $ctrl.productsIds = $ctrl.products.map(
                    product => parseInt(product.id)
                );
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

    $ctrl.$onDestroy = () => {};
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
        'VoucherService',
        'ProductService',
        'PushNotificationsService',
        ModalVouchersUploadComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/modal-vouchers-upload.html';
    }
};
