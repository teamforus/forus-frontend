let ProductVouchersComponent = function(
    $q,
    $state,
    $stateParams,
    $timeout,
    DateService,
    FileService,
    ModalService,
    VoucherService,
    PageLoadingBarService
) {
    let $ctrl = this;

    $ctrl.exportFields = [];

    $ctrl.states = [{
        value: null,
        name: 'Selecteer...'
    }, {
        value: 1,
        name: 'Ja'
    }, {
        value: 0,
        name: 'Nee...'
    }];

    $ctrl.sources = [{
        value: 'all',
        name: 'Alle'
    }, {
        value: 'user',
        name: 'Gebruiker'
    }, {
        value: 'employee',
        name: 'Medewerker'
    }];

    $ctrl.in_use = [{
        value: null,
        name: 'Selecteer...'
    }, {
        value: 1,
        name: 'Ja'
    }, {
        value: 0,
        name: 'Nee'
    }];

    $ctrl.voucher_states = VoucherService.getStates();

    $ctrl.filters = {
        show: false,
        defaultValues: {
            q: '',
            granted: null,
            amount_min: null,
            amount_max: null,
            from: null,
            to: null,
            state: null,
            in_use: null,
            count_per_identity_min: 0,
            count_per_identity_max: null,
            type: 'product_voucher',
            source: 'all',
            sort_by: 'created_at',
            sort_order: 'desc',
        },
        values: {},
        reset: function() {
            this.values = { ...this.defaultValues };
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false, 0);
    };

    $ctrl.getExportFields = () => {
        return VoucherService.getExportFields($ctrl.organization.id).then(res =>
            $ctrl.exportFields = res.data     
        );
    };

    $ctrl.showQrCode = ($event, voucher) => {
        $event.stopPropagation();
        $event.preventDefault();

        ModalService.open('voucherQrCode', {
            voucher: voucher,
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onSent: () => $ctrl.onPageChange($ctrl.filters.values),
            onAssigned: () => $ctrl.onPageChange($ctrl.filters.values)
        });
    };

    $ctrl.createProductVoucher = () => {
        ModalService.open('productVoucherCreate', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onCreated: () => $ctrl.onPageChange($ctrl.filters.values)
        }, { maxLoadTime: 1000 });
    };

    $ctrl.uploadProductVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            type: $ctrl.filters.values.type,
            organizationFunds: $ctrl.funds,
            done: () => $state.reload()
        });
    };

    $ctrl.getQueryParams = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        return {
            ..._query, ...{
                from: _query.from ? DateService._frontToBack(_query.from) : null,
                to: _query.to ? DateService._frontToBack(_query.to) : null,
                fund_id: $ctrl.fund.id,
            }
        };
    };

    $ctrl.exportPdf = (type, fields_list) => {
        VoucherService.downloadQRCodes($ctrl.organization.id, {
            ...$ctrl.getQueryParams($ctrl.filters.values),
            ...{ table_data_type: type, qr_codes_type: 'pdf', fields_list: fields_list }
        }).then(res => {
            FileService.downloadFile(
                'vouchers_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.zip',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        }, res => {
            res.data.text().then((data) => {
                data = JSON.parse(data);

                if (data.message) {
                    PushNotificationsService.danger(data.message);
                }
            });
        });
    };

    $ctrl.exportQRCodesXls = (fields_list) => {
        return $q((resolve, reject) => {
            VoucherService.downloadQRCodesXls($ctrl.organization.id, {
                ...$ctrl.getQueryParams($ctrl.filters.values),
                fields_list: fields_list,
            }).then(res => resolve(
                $ctrl.xlsData = res.data
            ), reject);
        });
    };

    $ctrl.exportQRCodesData = (fields_list, qr_codes_type) => {
        return $q((resolve, reject) => {
            VoucherService.downloadQRCodesData($ctrl.organization.id, {
                ...$ctrl.getQueryParams($ctrl.filters.values), ...{
                    export_type: 'png',
                    fields_list: fields_list,
                    export_only_data: qr_codes_type !== 'png' ? 1 : 0,
                }
            }).then(res => resolve(
                $ctrl.qrCodesData = res.data
            ), reject);
        });
    };

    $ctrl.exportImages = (type, fields_list, qr_codes_type) => {
        const promisses = [];

        if (type == 'xls') {
            promisses.push($ctrl.exportQRCodesXls(fields_list));
        };

        if (type == 'csv' || qr_codes_type == 'png') {
            promisses.push($ctrl.exportQRCodesData(fields_list, qr_codes_type));
        };

        PageLoadingBarService.setProgress(0);

        $q.all(promisses).then(() => {
            const zip = new JSZip();
            const csvName = 'qr_codes.csv';

            const qrCodesData = $ctrl.qrCodesData;
            const vouchersData = qr_codes_type == 'png' ? qrCodesData.vouchersData : [];
            const imgDirectory = vouchersData.length > 0 ? zip.folder("images") : null;
            const promises = [];

            PageLoadingBarService.setProgress(10);
            console.info('- data loaded from the api.');

            if (type == 'csv') {
                zip.file(csvName, qrCodesData.rawCsv);
            }

            if (type == 'xls') {
                zip.file('qr_codes.xls', $ctrl.xlsData);
            }

            PageLoadingBarService.setProgress(20);
            vouchersData.forEach((voucherData, index) => {
                promises.push(new Promise((resolve) => {
                    console.info('- making qr file ' + (index + 1) + ' from ' + vouchersData.length + '.');
                    document.imageConverter.makeQrImage(voucherData.value).then((data) => {
                        resolve({
                            ...voucherData,
                            ...{ imageData: data.slice('data:image/png;base64,'.length) }
                        });
                    })
                }));
            });

            Promise.all(promises).then((data) => {
                console.info('- inserting images into .zip archive.');
                data.forEach((imgData) => imgDirectory.file(imgData.name + ".png", imgData.imageData, { base64: true }));

                PageLoadingBarService.setProgress(80);

                console.info('- building .zip file.');
                zip.generateAsync({ type: "blob" }).then(function(content) {
                    PageLoadingBarService.setProgress(95);
                    console.info('- downloading .zip file.');
                    saveAs(content, 'vouchers_' + moment().format(
                        'YYYY-MM-DD HH:mm:ss'
                    ) + '.zip');
                    PageLoadingBarService.setProgress(100);
                });
            }, console.error);
        }, res => {
            res.data.text().then((data) => {
                data = JSON.parse(data);

                if (data.message) {
                    PushNotificationsService.danger(data.message);
                }
            });
        });
    };

    $ctrl.exportQRCodes = () => {
        $ctrl.getExportFields().then(res => {
            ModalService.open('exportData', {
                fields: $ctrl.exportFields,
                success: (data) => {
                    if (data.qrCodesExportType === 'pdf') {
                        $ctrl.exportPdf(data.fileType, data.exportFieldsRawList);
                    } else {
                        $ctrl.exportImages(
                            data.fileType, 
                            data.exportFieldsRawList, 
                            data.qrCodesExportType
                        );
                    }
                }
            });
        });
    };

    $ctrl.onPageChange = (query) => {
        VoucherService.index(
            $ctrl.organization.id,
            $ctrl.getQueryParams(query),
        ).then((res => $ctrl.vouchers = res.data));
    };

    $ctrl.showTooltip = (e, target) => {
        e.originalEvent.stopPropagation();
        $ctrl.vouchers.data.forEach(voucher => {
            voucher.showTooltip = false;
        });
        target.showTooltip = true;
    };

    $ctrl.hideTooltip = (e, target) => {
        e.stopPropagation();
        e.preventDefault();
        $timeout(() => target.showTooltip = false, 0);
    };

    $ctrl.init = () => {
        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
        $ctrl.fundClosed = $ctrl.fund.state == 'closed';
    };

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;
        $ctrl.init();
    };

    $ctrl.$onInit = () => {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        if (!$ctrl.fund) {
            if ($ctrl.funds.length == 1) {
                $state.go('product-vouchers', {
                    organization_id: $state.params.organization_id,
                    fund_id: $ctrl.funds[0].id,
                });
            } else if ($ctrl.funds.length == 0) {
                /* alert('Sorry, but no funds were found to add vouchers.');
                $state.go('home'); */
            }
        } else {
            $ctrl.init();
        }
    };
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        organization: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        '$timeout',
        'DateService',
        'FileService',
        'ModalService',
        'VoucherService',
        'PageLoadingBarService',
        ProductVouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/product-vouchers.html'
};
