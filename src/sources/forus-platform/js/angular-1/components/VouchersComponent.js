let VouchersComponent = function(
    $q,
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

    $ctrl.exportFields = [{
        name: 'Toegekend',
        key:  'granted'
    }, {
        name: 'E-mailadres',
        key:  'identity_email'
    }, {
        name: 'Aanmaker',
        key:  'source'
    }, {
        name: 'In gebruik',
        key:  'in_use'
    }, {
        name: 'Status',
        key:  'state'
    }, {
        name: 'Bedrag',
        key:  'amount'
    }, {
        name: 'In gebruik datum',
        key:  'in_use_date'
    }, {
        name: 'Activatiecode',
        key:  'activation_code'
    }, {
        name: 'Fondsnaam',
        key:  'fund_name'
    }, {
        name: 'BSN (door medewerker)',
        key:  'reference_bsn'
    }, {
        name: 'Uniek nummer',
        key:  'activation_code_uid'
    }, {
        name: 'Aangemaakt op',
        key:  'created_at'
    }, {
        name: 'BSN (DigiD)',
        key:  'identity_bsn'
    }, {
        name: 'Notitie',
        key:  'note'
    }, {
        name: 'Verlopen op',
        key:  'expire_at'
    }];

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

    $ctrl.showQrCode = ($event, voucher) => {
        $event.stopPropagation();
        $event.preventDefault();

        ModalService.open('voucherQrCode', {
            voucher: voucher,
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onSent: () => $ctrl.onPageChange($ctrl.filters.values),
            onAssigned: () => $ctrl.onPageChange($ctrl.filters.values),
        });
    };

    $ctrl.createVoucher = () => {
        ModalService.open('voucherCreate', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onCreated: () => $ctrl.onPageChange($ctrl.filters.values),
        });
    }

    $ctrl.uploadVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            fund: $ctrl.fund,
            type: $ctrl.filters.values.type,
            organization: $ctrl.organization,
            organizationFunds: $ctrl.funds,
            done: () => $state.reload(),
        });
    };

    $ctrl.downloadExampleCsv = () => {
        FileService.downloadFile(
            'voucher_upload_sample.csv',
            VoucherService.sampleCSV('voucher')
        );
    };

    $ctrl.getQueryParams = (query) => {
        const _query = JSON.parse(JSON.stringify(query));

        return {
            ..._query, ...{
                from: _query.from ? DateService._frontToBack(_query.from) : null,
                to: _query.to ? DateService._frontToBack(_query.to) : null,
                fund_id: $ctrl.fund.id,
            }
        };
    };

    $ctrl.exportPdf = (fieldsList) => {
        VoucherService.downloadQRCodes($ctrl.organization.id, {
            ...$ctrl.getQueryParams($ctrl.filters.values),
            ...{ export_type: 'pdf', fields_list: fieldsList }
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

    $ctrl.exportQRCodesXls = (fieldsList) => {
        return $q((resolve, reject) => {
            VoucherService.downloadQRCodesXls($ctrl.organization.id, {
                ...$ctrl.getQueryParams($ctrl.filters.values), ...{
                    fields_list: fieldsList
                }
            }).then(res => resolve(
                $ctrl.xlsData = res.data
            ), reject);
        });
    };

    $ctrl.exportQRCodesData = (type, fieldsList) => {
        return $q((resolve, reject) => {
            VoucherService.downloadQRCodesData($ctrl.organization.id, {
                ...$ctrl.getQueryParams($ctrl.filters.values), ...{
                    export_type: 'png',
                    fields_list: fieldsList,
                    export_only_data: type === 'xls' || type === 'csv' ? 1 : 0,
                }
            }).then(res => resolve(
                $ctrl.qrCodesData = res.data
            ), reject);
        });
    };

    $ctrl.exportImages = (type, fieldsList) => {
        const promisses = [];

        if (type == 'xls' || type == 'png') {
            promisses.push($ctrl.exportQRCodesXls(fieldsList));
        };

        if (type == 'csv' || type == 'png') {
            promisses.push($ctrl.exportQRCodesData(type, fieldsList));
        };

        PageLoadingBarService.setProgress(0);

        $q.all(promisses).then(() => {
            const zip = new JSZip();
            const csvName = 'qr_codes.csv';

            const qrCodesData = $ctrl.qrCodesData;
            const vouchersData = type == 'png' ? qrCodesData.vouchersData : [];
            const imgDirectory = vouchersData.length > 0 ? zip.folder("images") : null;
            const promises = [];

            PageLoadingBarService.setProgress(10);
            console.info('- data loaded from the api.');

            if (type == 'png' || type == 'csv') {
                zip.file(csvName, qrCodesData.rawCsv);
            }

            if (type == 'png' || type == 'xls') {
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
        ModalService.open('exportData', {
            fields: $ctrl.exportFields,
            success: (data) => {
                if (data.fileType === 'pdf') {
                    $ctrl.exportPdf(data.exportFieldsRawList);
                } else {
                    $ctrl.exportImages(data.fileType, data.exportFieldsRawList);
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
        '$q',
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
