const ReservationExtraPaymentsComponent = function (
    $q,
    $state,
    $stateParams,
    PaginatorService,
    PageLoadingBarService,
    ReservationExtraPaymentService,
) {
    const $ctrl = this;

    $ctrl.filters = {
        show: false,
        values: {
            q: $stateParams.q || '',
            fund_id: $stateParams.fund_id || null,
        },
        valuesDefault: {
            q: '',
            fund_id: null,
            per_page: 20,
            order_by: 'created_at',
            order_dir: 'desc',
        },
        reset: () => {
            $ctrl.filters.values = { ...$ctrl.filters.valuesDefault };
            $ctrl.updateState($ctrl.filters.valuesDefault);
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $ctrl.filters.show = false;
    };

    $ctrl.fetchExtraPayments = (query) => {
        return $q((resolve, reject) => {
            PageLoadingBarService.setProgress(0);
            ReservationExtraPaymentService.list($ctrl.organization.id, query).then(resolve, reject);
        }).finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.mapExtraPayments = (extraPayments) => {
        const data = extraPayments.data.map((extraPayment) => {
            const ui_sref = ({
                id: extraPayment.id,
                organization_id: $ctrl.organization.id,
            });

            return { ...extraPayment, ui_sref };
        });

        $ctrl.extraPayments = { ...extraPayments, data };
    };

    $ctrl.onPageChange = (query) => {
        $ctrl.fetchExtraPayments(query).then((res => {
            $ctrl.mapExtraPayments(res.data);
            $ctrl.updateState({...query});
        }));
    };

    $ctrl.updateState = (query) => {
        $state.go(
            'extra-payments',
            { ...query, organization_id: $ctrl.organization.id },
            { location: 'replace' },
        );
    };

    $ctrl.$onInit = () => {
        $ctrl.funds.unshift({
            id: null,
            name: 'Selecteer fonds',
        });

        $ctrl.mapExtraPayments($ctrl.extraPayments);
        $ctrl.filters = PaginatorService.syncPageFilters($ctrl.filters, $ctrl.paginationPerPageKey, $ctrl.paginationPerPageDefault);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
        extraPayments: '<',
        paginationPerPageKey: '<',
        paginationPerPageDefault: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'PaginatorService',
        'PageLoadingBarService',
        'ReservationExtraPaymentService',
        ReservationExtraPaymentsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservation-extra-payments.html',
};