const { pick } = require("lodash");

const VouchersComponent = function (
    $state,
    $stateParams,
    $timeout,
    DateService,
    ModalService,
    VoucherService,
    LocalStorageService,
    VoucherExportService,
    PageLoadingBarService,
) {
    const $ctrl = this;

    $ctrl.paginationStorageKey = 'vouchers_per_page';

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
            amount_available_min: null,
            amount_available_max: null,
            date_type: 'created_at',
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
        values: pick({ 
            ...$stateParams,
            per_page: LocalStorageService.getCollectionItem('pagination', $ctrl.paginationStorageKey, 15),
        }, [
            'q', 'granted', 'amount_min', 'amount_max', 'date_type', 'from', 'to',
            'state', 'in_use', 'count_per_identity_min', 'count_per_identity_max',
            'type', 'source', 'sort_by', 'sort_order', 'per_page', 'page', 'fund_id',
        ]),
        reset: function () {
            this.values = { ...this.defaultValues };
            $ctrl.updateState(this.defaultValues);
        }
    };

    $ctrl.updateState = (query) => {
        $state.go(
            'vouchers',
            { ...query, organization_id: $ctrl.organization.id, fund_id: $ctrl.fund.id },
            { location: 'replace' },
        );
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
        }, { maxLoadTime: 1000 });
    };

    $ctrl.uploadVouchersCsv = () => {
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

        const type = 'budget';
        const filters = $ctrl.getQueryParams($ctrl.filters.values);

        VoucherExportService.exportVouchers($ctrl.organization.id, filters, type);
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.loading = true;
        PageLoadingBarService.setProgress(0);

        VoucherService.index(
            $ctrl.organization.id,
            $ctrl.getQueryParams(query),
        ).then((res) => {
            $ctrl.vouchers = res.data;
            $ctrl.updateState(query);
            $ctrl.loading = false;
        }).finally(() => PageLoadingBarService.setProgress(100));
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
        $ctrl.fundClosed = $ctrl.fund.state == 'closed';
    };

    $ctrl.onFundSelect = (fund) => {
        $ctrl.fund = fund;
        $ctrl.init();

        $ctrl.onPageChange($ctrl.filters.values);
    };

    $ctrl.$onInit = () => {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        if (!$ctrl.fund && $ctrl.funds.length > 0) {
            return $state.go('vouchers', {
                organization_id: $state.params.organization_id,
                fund_id: $ctrl.funds[0].id,
            });
        }

        if ($ctrl.fund) {
            $ctrl.init();
            $ctrl.onPageChange($ctrl.filters.values);
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
        'LocalStorageService',
        'VoucherExportService',
        'PageLoadingBarService',
        VouchersComponent,
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html',
};
