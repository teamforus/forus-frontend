let ProductVouchersComponent = function(
    $state,
    $stateParams,
    $timeout,
    DateService,
    FileService,
    ModalService,
    VoucherService
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
        name: 'Nee...'
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function () {
            this.values.q = '';
            this.values.granted = null;
            this.values.fund_id = $ctrl.fund.id;
            this.values.amount_min = null;
            this.values.amount_max = null;
            this.values.from = null;
            this.values.to = null;
            this.values.type = 'product_voucher';
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

    $ctrl.createProductVoucher = () => {
        ModalService.open('product_voucher_create', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onCreated: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            }
        });
    };

    $ctrl.uploadProductVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            type: $ctrl.filters.values.type,
            done: () => {
                $state.reload();
            }
        });
    };

    $ctrl.onPageChange = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        _query = Object.assign(_query, {
            'from': _query.from ? DateService._frontToBack(_query.from) : null,
            'to': _query.to ? DateService._frontToBack(_query.to) : null,
            'sort_by': 'created_at',
            'sort_order': 'desc'
        });

        VoucherService.index(
            $ctrl.organization.id,
            Object.assign(_query, {
                fund_id: $ctrl.fund.id,
            })
        ).then((res => {
            $ctrl.vouchers = res.data;
            $ctrl.getUnassignedQRCodes(query);
        }));
    };

    $ctrl.getQueryParams = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        return Object.assign(_query, {
            'from': _query.from ? DateService._frontToBack(_query.from) : null,
            'to': _query.to ? DateService._frontToBack(_query.to) : null,
            'sort_by': 'created_at',
            'sort_order': 'desc'
        });
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
        ModalService.open('voucherExportType', {
            success: (data) => {
                VoucherService.downloadQRCodes(
                    $ctrl.organization.id,
                    Object.assign($ctrl.getQueryParams($ctrl.filters.values), {
                        unassigned: 1,
                        export_type: data.exportType
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
            }
        });
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
        $ctrl.fundClosed = $ctrl.fund.state == 'closed';

        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
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
        '$state',
        '$stateParams',
        '$timeout',
        'DateService',
        'FileService',
        'ModalService',
        'VoucherService',
        ProductVouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/product-vouchers.html'
};