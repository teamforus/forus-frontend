let VouchersComponent = function(
    $state,
    $stateParams,
    $timeout,
    FileService,
    DateService,
    ModalService,
    VoucherService,
    PushNotificationsService,
    PageLoadingBarService
) {
    let $ctrl = this;

    $ctrl.states = [{
        value: null,
        name: 'Selecteer...'
    }, {
        value: 1,
        name: 'Ja'
    }, {
        value: 0,
        name: 'Nee'
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

    $ctrl.voucher_states = [{
        value: null,
        name: 'Alle'
    }, {
        value: 'pending',
        name: 'Inactief'
    }, {
        value: 'active',
        name: 'Actief'
    }];

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
            type: 'fund_voucher',
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

    $ctrl.showQrCode = (voucher) => {
        ModalService.open('voucher_qr_code', {
            voucher: voucher,
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onSent: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            },
            onAssigned: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            }
        });
    };

    $ctrl.createVoucher = () => {
        ModalService.open('voucher_create', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onCreated: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            }
        });
    }

    $ctrl.uploadVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            type: $ctrl.filters.values.type,
            done: () => {
                $state.reload();
            }
        });
    };

    $ctrl.downloadExampleCsv = () => {
        FileService.downloadFile(
            'voucher_upload_sample.csv',
            VoucherService.sampleCSV('voucher')
        );
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

    $ctrl.exportPdf = () => {
        VoucherService.downloadQRCodes($ctrl.organization.id, {
            ...$ctrl.getQueryParams($ctrl.filters.values), 
            ...{ export_type: 'pdf' }
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

    $ctrl.exportImages = (type) => {
        PageLoadingBarService.setProgress(0);
        VoucherService.downloadQRCodesData($ctrl.organization.id, {
            ...$ctrl.getQueryParams($ctrl.filters.values), ...{
                export_type: 'png', 
                export_only_data: type === 'data' ? 1 : 0,
            }
        }).then(async res => {
            let data = res.data;
            let csvContent = data.rawCsv;
            let csvName = 'qr_codes.csv';
            let vouchersData = data.vouchersData;
            let zip = new JSZip();
            let img = vouchersData.length > 0 ? zip.folder("images") : null;
            let promises = [];

            PageLoadingBarService.setProgress(10);
            console.info('- data loaded from the api.');

            zip.file(csvName, csvContent);
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
                data.forEach((imgData) => img.file(imgData.name + ".png", imgData.imageData, { base64: true }));

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
        ModalService.open('voucherExportType', {
            success: (data) => {
                if (data.exportType === 'pdf') {
                    $ctrl.exportPdf();
                } else {
                    $ctrl.exportImages(data.exportType);
                }
            }
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
                $state.go('vouchers', {
                    organization_id: $state.params.organization_id,
                    fund_id: $ctrl.funds[0].id,
                });
            } else if ($ctrl.funds.length == 0) {
                // alert('Sorry, but no funds were found to add vouchers.');
                // $state.go('funds');
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
        '$state',
        '$stateParams',
        '$timeout',
        'FileService',
        'DateService',
        'ModalService',
        'VoucherService',
        'PushNotificationsService',
        'PageLoadingBarService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};