let VouchersComponent = function(
    $state,
    $timeout,
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
            funds: $ctrl.funds.filter(fund => fund.id),
            organization: $ctrl.organization,
            onCreated: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            }
        });
    }

    $ctrl.uploadVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            funds: $ctrl.funds.filter(fund => fund.id),
            organization: $ctrl.organization,
            done: () => {
                console.log('vouchers->done');
                $state.reload();
            }
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

    $ctrl.init = async () => {
        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = () => {
        $ctrl.funds.unshift({
            id: null,
            name: 'Select...'
        });

        $ctrl.init();
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
    },
    controller: [
        '$state',
        '$timeout',
        'DateService',
        'ModalService',
        'VoucherService',
        VouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html'
};