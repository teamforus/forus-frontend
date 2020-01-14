let ProductVouchersComponent = function(
    $state,
    $stateParams,
    $timeout,
    DateService,
    ModalService,
    VoucherService,
    ProductService,
    FileService
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
        reset: function () {
            this.values.q = '';
            this.values.granted = null;
            this.values.fund_id = $stateParams.fund_id ?
                $stateParams.fund_id : 
                ($ctrl.funds[0] ? $ctrl.funds[0].id : null);
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

    $ctrl.createProductVoucher = () => {
        ModalService.open('product_voucher_create', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            onCreated: () => {
                $ctrl.onPageChange($ctrl.filters.values);
            }
        });
    }

    $ctrl.uploadProductVouchersCsv = () => {
        ModalService.open('vouchersUpload', {
            fund: $ctrl.fund,
            organization: $ctrl.organization,
            type: 'product_voucher',
            done: () => {
                $state.reload();
            }
        });
    };

    $ctrl.downloadExampleCsv = () => {
        ProductService.listAll({
            fund_id: $ctrl.fund.id
        }).then((res) => {
            let products = res.data.data;
            let productsIds = products.map(
                product => parseInt(product.id)
            );
        
            FileService.downloadFile(
                'voucher_upload_sample.csv',
                VoucherService.sampleCSV('product_voucher', productsIds[0])
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
        $ctrl.fundClosed = $ctrl.fund.state == 'closed';

        $ctrl.resetFilters();
        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = () => {
        if (!$ctrl.fund) {
            if ($ctrl.funds.length == 1) {
                $state.go('product-vouchers', {
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
        'DateService',
        'ModalService',
        'VoucherService',
        'ProductService',
        'FileService',
        ProductVouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/product-vouchers.html'
};