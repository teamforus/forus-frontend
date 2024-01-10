const { pick } = require("lodash");

const VouchersComponent = function (
    $state,
    $stateParams,
    $timeout,
    DateService,
    ModalService,
    VoucherService,
    PaginatorService,
    VoucherExportService,
    PageLoadingBarService,
) {
    const $ctrl = this;
    const anyFundMedia = { sizes: { thumbnail: './assets/img/menu/icon-my_funds.svg' } };

    $ctrl.paginationPerPageKey = "vouchers";

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
            fund_id: null,
            implementation_id: null,
            sort_by: 'created_at',
            sort_order: 'desc',
            per_page: PaginatorService.getPerPage($ctrl.paginationPerPageKey, 25),
        },
        values: pick({
            ...$stateParams,
            per_page: PaginatorService.getPerPage($ctrl.paginationPerPageKey, 25),
        }, [
            'q', 'granted', 'amount_min', 'amount_max', 'date_type', 'from', 'to',
            'state', 'in_use', 'count_per_identity_min', 'count_per_identity_max',
            'type', 'source', 'sort_by', 'sort_order', 'per_page', 'page', 'fund_id',
            'implementation_id',
        ]),
        reset: function () {
            this.values = { ...this.defaultValues };
            $ctrl.updateState(this.defaultValues);
        }
    };

    $ctrl.toggleActions = (e, voucher) => {
        $ctrl.onClickOutsideMenu(e);
        voucher.showMenu = true;
    };

    $ctrl.onClickOutsideMenu = (e) => {
        e.stopPropagation();
        $ctrl.vouchers.data.forEach((voucher) => voucher.showMenu = false);
    };

    $ctrl.updateState = (query) => {
        $state.go(
            'vouchers',
            { ...query, organization_id: $ctrl.organization.id },
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

        $ctrl.onClickOutsideMenu($event);

        ModalService.open('voucherQrCode', {
            voucher: voucher,
            organization: $ctrl.organization,
            onSent: () => $ctrl.onPageChange($ctrl.filters.values),
            onAssigned: () => $ctrl.onPageChange($ctrl.filters.values),
        });
    };

    $ctrl.createVoucher = () => {
        ModalService.open('fundSelect', {
            funds: $ctrl.funds.filter((fund) => fund.id),
            fund_id: $ctrl.filters.values.fund_id,
            onSelect: (fund) => {
                ModalService.open('voucherCreate', {
                    fund,
                    organization: $ctrl.organization,
                    onCreated: () => $ctrl.onPageChange($ctrl.filters.values),
                }, { maxLoadTime: 1000 });
            },
        });
    }

    $ctrl.uploadVouchersCsv = () => {
        ModalService.open('fundSelect', {
            funds: [
                // Allow csv with multiple funds
                { id: null, name: 'Alle fondsen', logo: anyFundMedia },
                ...$ctrl.funds.filter((fund) => fund.id),
            ],
            fund_id: $ctrl.filters.values.fund_id,
            onSelect: (fund) => {
                ModalService.open('vouchersUpload', {
                    fund: fund,
                    type: $ctrl.filters.values.type,
                    organization: $ctrl.organization,
                    organizationFunds: !fund.id ?
                        $ctrl.funds :
                        $ctrl.funds.filter((item) => item.id === fund.id),
                    done: () => $state.reload(),
                });
            },
        });
    };

    $ctrl.getQueryParams = (query = {}) => {
        const data = angular.copy(query);
        const from = data.from ? DateService._frontToBack(data.from) : null;
        const to = data.to ? DateService._frontToBack(data.to) : null;

        return {
            ...data,
            date_type: null,
            from: query.date_type === 'created_at' ? from : null,
            to: query.date_type === 'created_at' ? to : null,
            in_use_from: query.date_type === 'used_at' ? from : null,
            in_use_to: query.date_type === 'used_at' ? to : null,
        };
    };

    $ctrl.exportVouchers = () => {
        $ctrl.filters.show = false;

        const type = 'budget';
        const filters = $ctrl.getQueryParams($ctrl.filters.values);

        VoucherExportService.exportVouchers(
            $ctrl.organization.id,
            $ctrl.fundsById[$ctrl.filters.values.fund_id]?.allow_voucher_records,
            filters,
            type,
        );
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

    $ctrl.$onInit = () => {
        $ctrl.emptyBlockLink = $state.href('funds-create', $stateParams);

        $ctrl.implementations.unshift({
            id: null,
            name: 'Alle implementaties',
        });

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle fondsen',
            logo: anyFundMedia,
        });

        $ctrl.fundsById = $ctrl.funds.reduce((obj, fund) => ({ ...obj, [fund.id]: fund }), {});
        $ctrl.onPageChange($ctrl.filters.values);
    };
};

module.exports = {
    bindings: {
        fund: '<',
        funds: '<',
        organization: '<',
        implementations: '<',
    },
    controller: [
        '$state',
        '$stateParams',
        '$timeout',
        'DateService',
        'ModalService',
        'VoucherService',
        'PaginatorService',
        'VoucherExportService',
        'PageLoadingBarService',
        VouchersComponent,
    ],
    templateUrl: 'assets/tpl/pages/vouchers.html',
};
