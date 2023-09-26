const ReservationsComponent = function (
    PageLoadingBarService,
    ProductReservationService,
) {
    const $ctrl = this;

    $ctrl.filters = {
        page: 1,
        per_page: 15,
        state: null,
        fund_id: null,
        archived: 0,
        organization_id: null,
    };

    $ctrl.states = [{
        name: 'In afwachting',
        value: 'pending',
    }, {
        name: 'Geaccepteerd',
        value: 'accepted',
    }, {
        name: 'Geweigerd',
        value: 'rejected',
    }, {
        name: 'Geannuleerd',
        value: 'canceled',
    }];

    $ctrl.onDelete = () => {
        $ctrl.onPageChange();
    };

    $ctrl.onPageChange = (query = {}) => {
        const filters = { ...$ctrl.filters, ...query };

        PageLoadingBarService.setProgress(0);

        ProductReservationService
            .list(filters)
            .then((res) => $ctrl.reservations = res.data)
            .finally(() => PageLoadingBarService.setProgress(100));
    };

    $ctrl.$onInit = function () {
        $ctrl.states.unshift({
            value: null,
            name: 'Selecteer status...',
        });

        $ctrl.funds.unshift({
            id: null,
            name: 'Alle tegoeden',
        });

        $ctrl.organizations.unshift({
            id: null,
            name: 'Selecteer aanbieder...',
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        reservations: '<',
        organizations: '<',
    },
    controller: [
        'PageLoadingBarService',
        'ProductReservationService',
        ReservationsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservations.html',
};