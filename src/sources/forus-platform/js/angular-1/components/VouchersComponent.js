let VouchersComponent = function(
    $state,
    $timeout,
    FileService,
    DateService,
    ModalService,
    VoucherService
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
            this.values.fund_id = $ctrl.funds[0] ? $ctrl.funds[0].id : null;
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

    $ctrl.exportUnassignedQRCodes = () => {
        VoucherService.downloadQRCodes(
            $ctrl.organization.id,
            $ctrl.filters.values.from,
            $ctrl.filters.values.to
        ).then(res => {
            FileService.downloadFile(
                'vouchers_' + moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                ) + '.zip',
                res.data,
                res.headers('Content-Type') + ';charset=utf-8;'
            );
        });
    };

    $ctrl.onPageChange = (query) => {
        let _query = JSON.parse(JSON.stringify(query));

        _query.from = _query.from ? DateService._frontToBack(_query.from) : null;
        _query.to = _query.to ? DateService._frontToBack(_query.to) : null;

        VoucherService.index(
            $ctrl.organization.id,
            _query
        ).then((res => {
            $ctrl.vouchers = res.data;
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
        '$timeout',
        'FileService',
        'DateService',
        'ModalService',
        'VoucherService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};