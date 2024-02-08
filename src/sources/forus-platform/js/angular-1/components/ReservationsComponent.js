const ReservationsComponent = function (
    $q,
    $timeout,
    $stateParams,
    ModalService,
    OrganizationService,
    PageLoadingBarService,
    PushNotificationsService,
    ProductReservationService,
    ProductReservationsExportService,
) {
    const $ctrl = this;

    $ctrl.empty = null;
    $ctrl.acceptedByDefault = false;
    $ctrl.showExtraPayments = false;

    $ctrl.shownReservationsType = $stateParams.reservations_type || 'active';

    $ctrl.states = [{
        key: null,
        name: 'Alle'
    }, {
        key: 'waiting',
        name: 'Wachtend op bijbetaling', // Waiting
    }, {
        key: 'pending',
        name: 'In afwachting', // Pending
    }, {
        key: 'accepted',
        name: 'Geaccepteerd' // Accepted
    }, {
        key: 'rejected',
        name: 'Geweigerd' // Rejected
    }, {
        key: 'expired',
        name: 'Verlopen' // Expired
    }, {
        key: 'canceled',
        name: 'Geannuleerd door aanbieder' // Canceled by provider
    }, {
        key: 'canceled_by_client',
        name: 'Geannuleerd door aanvrager' // Canceled by client
    }];

    $ctrl.extraPaymentStates = [{
        key: 'canceled_payment_expired',
        name: 'Geannuleerd door verlopen bijbetaling' // Canceled payment expired
    }, {
        key: 'canceled_payment_canceled',
        name: 'Geannuleerd door ingetrokken bijbetaling' // Canceled payment canceled
    }, {
        key: 'canceled_payment_failed',
        name: 'Geannuleerd door mislukte bijbetaling' // Canceled payment failed
    }];

    $ctrl.filters = {
        show: false,
        values: {},
        reset: function () {
            this.values.q = '';
            this.values.state = $ctrl.states[0].key;
            this.values.from = null;
            this.values.to = null;
            this.values.fund_id = null;
            this.values.product_id = null;
        }
    };

    $ctrl.resetFilters = () => {
        $ctrl.filters.reset();
    };

    $ctrl.hideFilters = () => {
        $timeout(() => $ctrl.filters.show = false, 0);
    };

    const fetchReservations = (query, archived = false) => {
        return ProductReservationService.list(
            $ctrl.organization.id,
            { ...$ctrl.filters.values, ...query, archived: archived ? 1 : 0 },
        );
    };

    const showExtraPaymentDetails = (reservations) => {
        const hasExtraPaymentsOnPage = reservations.filter((reservation) => {
            return reservation.extra_payment !== null;
        }).length > 0;

        return $ctrl.organization.can_view_provider_extra_payments || hasExtraPaymentsOnPage;
    }

    $ctrl.onPageChange = (query = {}) => {
        PageLoadingBarService.setProgress(0);

        $q.all([
            fetchReservations(query).then((res) => $ctrl.activeReservations = res.data),
            fetchReservations(query, true).then((res) => $ctrl.archivedReservations = res.data),
        ]).then(() => {
            $ctrl.reservations = $ctrl.shownReservationsType == 'active' ?
                $ctrl.activeReservations :
                $ctrl.archivedReservations

            $ctrl.showExtraPayments = showExtraPaymentDetails($ctrl.reservations.data);

            PageLoadingBarService.setProgress(100);
        });
    };

    $ctrl.acceptReservation = (reservation) => {
        ProductReservationService.confirmApproval(reservation, () => {
            ProductReservationService.accept($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.onPageChange();
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    }

    $ctrl.rejectReservation = (reservation) => {
        if (reservation.extra_payment?.is_paid && !reservation.extra_payment?.is_fully_refunded) {
            return ProductReservationService.showRejectInfoExtraPaid();
        }

        ProductReservationService.confirmRejection(() => {
            ProductReservationService.reject($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.onPageChange();
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    }

    $ctrl.setOrganization = (organization) => {
        $ctrl.organization = organization;
        $ctrl.acceptedByDefault = $ctrl.organization.reservations_auto_accept;
    }

    $ctrl.toggleAcceptByDefault = (value) => {
        const onEnable = () => {
            OrganizationService.updateAcceptReservations($ctrl.organization.id, value).then((res) => {
                $ctrl.setOrganization(res.data.data);
                PushNotificationsService.success('Opgeslagen!');
            });
        };

        const onDisable = () => {
            OrganizationService.updateAcceptReservations($ctrl.organization.id, value).then((res) => {
                $ctrl.setOrganization(res.data.data);
                PushNotificationsService.success('Opgeslagen!');
            });
        };

        const onCancel = () => {
            OrganizationService.read($ctrl.organization.id, value).then((res) => {
                $ctrl.setOrganization(res.data.data);
            });
        };

        if (value) {
            ModalService.open("dangerZone", {
                title: "Let op! Met deze instelling worden alle reserveringen direct geaccepteerd.",
                description_text: [
                    "Wilt u reserveringen automatisch accepteren? Ga dan akkoord met onderstaande voorwaarden:\n",
                    "- Het product of de dienst kan worden geleverd.",
                    "- De transactie wordt na veertien dagen verwerkt.",
                    "- De transactie kan op verzoek van de klant binnen veertien dagen worden geannuleerd."
                ].join("\n"),
                confirmation: "Ik ga akkoord met de voorwaarden.",
                cancelButton: "Annuleren",
                confirmButton: "Bevestigen",
                onConfirm: onEnable,
                onCancel: onCancel,
            });
        } else {
            onDisable();
        }
    };

    $ctrl.makeReservation = () => {
        ModalService.open('reservationCreate', {
            organization: $ctrl.organization,
            onCreated: () => $ctrl.onPageChange(),
        });
    };

    $ctrl.uploadReservations = () => {
        ModalService.open('reservationUpload', {
            organization: $ctrl.organization,
            onCreated: () => $ctrl.onPageChange(),
        });
    };

    $ctrl.exportReservations = () => {
        ProductReservationsExportService.export($ctrl.organization.id, $ctrl.filters.values);
    };

    $ctrl.archiveReservation = (reservation) => {
        ProductReservationService.confirmArchive(reservation, () => {
            ProductReservationService.archive($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.onPageChange();
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    };

    $ctrl.unarchiveReservation = (reservation) => {
        ProductReservationService.confirmUnarchive(reservation, () => {
            ProductReservationService.unarchive($ctrl.organization.id, reservation.id).then((res) => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.onPageChange();
            }, (res) => PushNotificationsService.danger(res.data.message));
        });
    };

    $ctrl.$onInit = () => {
        const { reservations_budget_enabled, reservations_subsidy_enabled } = $ctrl.organization;

        $ctrl.filters.reset();
        $ctrl.filters = PaginatorService.syncPageFilters($ctrl.filters, $ctrl.paginationPerPageKey);

        $ctrl.reservations = $ctrl.shownReservationsType == 'active' ?
            $ctrl.activeReservations :
            $ctrl.archivedReservations

        $ctrl.showExtraPayments = showExtraPaymentDetails($ctrl.reservations.data);
        $ctrl.acceptedByDefault = $ctrl.organization.reservations_auto_accept;
        $ctrl.reservationEnabled = reservations_budget_enabled || reservations_subsidy_enabled;

        $ctrl.states = [
            ...$ctrl.states,
            ...($ctrl.organization.can_view_provider_extra_payments ? $ctrl.extraPaymentStates : [])
        ];

        $ctrl.funds.unshift({
            fund: {
                id: null,
                name: 'Alle tegoeden',
            }
        });

        $ctrl.products.unshift({
            id: null,
            name: 'Alle aanbod',
        });
    };
};

module.exports = {
    bindings: {
        funds: '<',
        products: '<',
        organization: '<',
        activeReservations: '<',
        archivedReservations: '<',
        paginationPerPageKey: '<',
    },
    controller: [
        '$q',
        '$timeout',
        '$stateParams',
        'ModalService',
        'PaginatorService',
        'OrganizationService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'ProductReservationService',
        'ProductReservationsExportService',
        ReservationsComponent,
    ],
    templateUrl: 'assets/tpl/pages/reservations.html',
};