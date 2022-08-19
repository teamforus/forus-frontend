const VouchersShowComponent = function (
    $filter,
    ModalService,
    VoucherService,
    PermissionsService,
    PhysicalCardsService,
    PageLoadingBarService,
    PushNotificationsService,
    FundService
) {
    const $ctrl = this;
    const $translate = $filter('translate');

    const $translateDangerZone = (key) => $translate(
        `modals.danger_zone.increase_limit_multiplier.${key}`
    );

    const onStateChanged = function (promise, action = 'deactivation') {
        promise.then((res) => {
            $ctrl.voucher = res.data.data;
            $ctrl.logsDirective?.onPageChange();
            $ctrl.updateFlags();

            switch (action) {
                case 'deactivation': PushNotificationsService.success('Gelukt!', 'Voucher gedeactiveerd'); break;
                case 'activation': PushNotificationsService.success('Gelukt!', 'Voucher geactiveerd'); break;
            }
        }, (res) => {
            const data = res.data;
            const message = data.errors ? (Object.values(data.errors)[0] || [data.message])[0] : data.message;

            PushNotificationsService.danger('Error!', message);
        }).finally(() => PageLoadingBarService.setProgress(100))
    }

    $ctrl.deactivateVoucher = () => {
        ModalService.open('voucherDeactivation', {
            onSubmit: (data) => {
                PageLoadingBarService.setProgress(0);
                onStateChanged(VoucherService.deactivate($ctrl.organization.id, $ctrl.voucher.id, data));
            },
            voucher: $ctrl.voucher,
            organization: $ctrl.organization,
        });
    };

    $ctrl.activateVoucher = () => {
        ModalService.open('voucherActivation', {
            onSubmit: (data) => {
                PageLoadingBarService.setProgress(0);
                onStateChanged(VoucherService.activate($ctrl.organization.id, $ctrl.voucher.id, data), 'activation');
            },
            voucher: $ctrl.voucher,
            organization: $ctrl.organization,
        });
    };

    $ctrl.showQrCode = () => {
        ModalService.open('voucherQrCode', {
            voucher: $ctrl.voucher,
            fund: $ctrl.voucher.fund,
            organization: $ctrl.organization,
            onSent: () => $ctrl.fetchVoucher(),
            onAssigned: () => $ctrl.fetchVoucher(),
        });
    };

    $ctrl.addPhysicalCard = () => {
        ModalService.open('physicalCard', {
            voucher: $ctrl.voucher,
            organization: $ctrl.organization,
            onSent: () => $ctrl.fetchVoucher(),
            onAssigned: () => $ctrl.fetchVoucher(),
            onAttached: () => $ctrl.fetchVoucher(),
        });
    };

    $ctrl.orderPhysicalCard = () => {
        ModalService.open('physicalCardOrder', {
            voucher: $ctrl.voucher,
            onRequested: () => $ctrl.fetchVoucher(),
        });
    };

    $ctrl.deletePhysicalCard = () => {
        ModalService.open('dangerZone', {
            header: $translate('modals.modal_voucher_physical_card.delete_card.header'),
            title: $translate('modals.modal_voucher_physical_card.delete_card.title', { code: $ctrl.voucher.physical_card.code }),
            description: $translate('modals.modal_voucher_physical_card.delete_card.description'),
            cancelButton: $translate('modals.modal_voucher_physical_card.delete_card.cancelButton'),
            confirmButton: $translate('modals.modal_voucher_physical_card.delete_card.confirmButton'),

            onConfirm: () => {
                PhysicalCardsService.destroy(
                    $ctrl.organization.id,
                    $ctrl.voucher.id,
                    $ctrl.voucher.physical_card.id
                ).then(() => $ctrl.fetchVoucher());
            }
        });
    };

    $ctrl.fetchVoucher = () => {
        VoucherService.show($ctrl.organization.id, $ctrl.voucher.id).then(((res) => {
            $ctrl.voucher = res.data.data;
            $ctrl.logsDirective?.onPageChange();
            $ctrl.updateFlags();
        }));
    };

    $ctrl.updateFlags = () => {
        $ctrl.physicalCardsAvailable =
            $ctrl.voucher.fund.allow_physical_cards &&
            $ctrl.voucher.fund.type === 'subsidies' &&
            $ctrl.voucher.state !== 'deactivated';

        $ctrl.showMakeTransactionButton =
            PermissionsService.hasPermission($ctrl.organization, 'make_direct_payments') &&
            $ctrl.voucher.fund.type === 'budget' &&
            $ctrl.voucher.state === 'active' &&
            !$ctrl.fundClosed &&
            !$ctrl.voucher.product &&
            !$ctrl.voucher.expired;
    }

    $ctrl.incrementLimitMultiplier = () => {
        ModalService.open("dangerZone", {
            title: $translateDangerZone('title'),
            description: $translateDangerZone('description'),
            cancelButton: $translateDangerZone('buttons.cancel'),
            confirmButton: $translateDangerZone('buttons.confirm'),
            onConfirm: () => {
                VoucherService.update($ctrl.organization.id, $ctrl.voucher.id, {
                    limit_multiplier: $ctrl.voucher.limit_multiplier + 1
                }).then(() => {
                    $ctrl.voucher.limit_multiplier++;
                    PushNotificationsService.success('Opgeslagen!');
                }, (err) => {
                    PushNotificationsService.danger('Error!');
                    console.error(err);
                });
            }
        });
    }

    $ctrl.makeTransaction = () => {
        ModalService.open("voucherTransactionProvider", {
            voucher: $ctrl.voucher,
            organization: $ctrl.organization,
            fund: $ctrl.fund,
            onCreated: () => $ctrl.fetchVoucher(),
        });
    }

    $ctrl.registerLogsDirective = (directive) => {
        $ctrl.logsDirective = directive;
    };

    $ctrl.$onInit = function () {
        $ctrl.updateFlags();

        if ($ctrl.showMakeTransactionButton) {
            FundService.read($ctrl.organization.id, $ctrl.voucher.fund_id)
                .then((res) => $ctrl.fund = res.data.data);
        }

        $ctrl.eventFilters = {
            q: "",
            per_page: 15,
            loggable: ['voucher'],
            loggable_id: $ctrl.voucher.id
        };
    }
};

module.exports = {
    bindings: {
        voucher: '<',
        organization: '<',
    },
    controller: [
        '$filter',
        'ModalService',
        'VoucherService',
        'PermissionsService',
        'PhysicalCardsService',
        'PageLoadingBarService',
        'PushNotificationsService',
        'FundService',
        VouchersShowComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers-show.html'
};