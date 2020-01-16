let VouchersComponent = function(
    $state,
    $stateParams,
    $timeout,
    FileService,
    DateService,
    ModalService,
    VoucherService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.states = [{
        value: null,
        name: 'Select...'
    }, {
        value: 1,
        name: 'Ja'
    }, {
        value: 0,
        name: 'Nee...'
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function() {
            this.values.q = '';
            this.values.granted = null;
            this.values.fund_id = $stateParams.fund_id ?
                $stateParams.fund_id : 
                ($ctrl.funds[0] ? $ctrl.funds[0].id : null);
            this.values.amount_min = null;
            this.values.amount_max = null;
            this.values.from = null;
            this.values.to = null;
            this.values.type = 'fund_voucher';
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => {
            $ctrl.filters.show = false
        }, 0);
    };

    $ctrl.showQrCode = (voucher) => {
        ModalService.open('voucher_qr_code', {
            voucher: voucher,
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

        _query.from = _query.from ? DateService._frontToBack(_query.from) : null;
        _query.to = _query.to ? DateService._frontToBack(_query.to) : null;

        return _query;
    }

    $ctrl.getUnassignedQRCodes = (query) => {
        VoucherService.index(
            $ctrl.organization.id,
            Object.assign($ctrl.getQueryParams(query), {
                per_page: 1,
                unassigned: 1
            })
        ).then(res => {
            $ctrl.hasExportableQRCodes = res.data.data.length;
        });
    };

    $ctrl.exportUnassignedQRCodes = () => {
        VoucherService.downloadQRCodes(
            $ctrl.organization.id,
            Object.assign($ctrl.getQueryParams($ctrl.filters.values), {
                unassigned: 1
            })
        ).then(res => {
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

    $ctrl.onPageChange = (query) => {
        VoucherService.index(
            $ctrl.organization.id,
            $ctrl.getQueryParams(query)
        ).then((res => {
            $ctrl.vouchers = res.data;

            $ctrl.getUnassignedQRCodes(query);
        }));
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

    $ctrl.init = async () => {
        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.fund) {
            if ($ctrl.funds.length == 1) {
                $state.go('vouchers', {
                    organization_id: $state.params.organization_id,
                    fund_id: $ctrl.funds[0].id,
                });
            } else if ($ctrl.funds.length == 0) {
                alert('Sorry, but no funds were found to add vouchers.');
                $state.go('home');
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
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};