const ProductVouchersComponent = function(
    $state,
    $stateParams,
    $timeout,
    DateService,
    ModalService,
    VoucherService,
    VoucherExportService
) {
    const $ctrl = this;

    $ctrl.states = [
        { value: null, name: 'Selecteer...' },
        { value: 1, name: 'Ja' },
        { value: 0, name: 'Nee' },
    ];

    $ctrl.sources = [
        { value: 'all', name: 'Alle' },
        { value: 'user', name: 'Gebruiker' },
        { value: 'employee', name: 'Medewerker' },
    ];

    $ctrl.in_use = [
        { value: null, name: 'Selecteer...' },
        { value: 1, name: 'Ja' },
        { value: 0, name: 'Nee' },
    ];

    $ctrl.date_types = [
        { value: 'created_at', name: 'Aanmaakdatum' },
        { value: 'used_at', name: 'Transactiedatum' },
    ];

    $ctrl.voucher_states = VoucherService.getStates();

    $ctrl.filters = {
        show: false,
        defaultValues: {
            q: '',
            granted: null,
            amount_min: null,
            amount_max: null,
            date_type: 'created_at',
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
            type: $ctrl.filters.values.type,
            organization: $ctrl.organization,
            organizationFunds: $ctrl.funds,
            done: () => $state.reload(),
        });
    };

    $ctrl.getQueryParams = (query = {}) => {
        const data = angular.copy(query);
        const from = data.from ? DateService._frontToBack(data.from) : null;
        const to = data.to ? DateService._frontToBack(data.to) : null;

        return {
            ...{ ...data, fund_id: $ctrl.fund.id, date_type: null },
            ...{
                from: query.date_type === 'created_at' ? from : null,
                to: query.date_type === 'created_at' ? to : null,
                in_use_from: query.date_type === 'used_at' ? from : null,
                in_use_to: query.date_type === 'used_at' ? to : null,
            }
        };
    };

    $ctrl.exportVouchers = () => {
        $ctrl.filters.show = false;
        
        const type = 'product';
        const filters = $ctrl.getQueryParams($ctrl.filters.values);

        VoucherExportService.exportVouchers($ctrl.organization.id, filters, type);
    };

    $ctrl.onPageChange = (query) => {
        VoucherService.index(
            $ctrl.organization.id,
            $ctrl.getQueryParams(query),
        ).then((res => $ctrl.vouchers = res.data));
    };

    $ctrl.showTooltip = (e, target) => {
        e.originalEvent.stopPropagation();
        $ctrl.vouchers.data.forEach((voucher) => voucher.showTooltip = voucher == target);
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
        '$state',
        '$stateParams',
        '$timeout',
        'DateService',
        'ModalService',
        'VoucherService',
        'VoucherExportService',
        ProductVouchersComponent
    ],
    templateUrl: 'assets/tpl/pages/product-vouchers.html'
};
