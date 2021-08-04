const VouchersShowComponent = function(
    $filter,
    $timeout,
    ModalService,
    VoucherService,
    PhysicalCardsService,
    PageLoadingBarService,
    PushNotificationsService,
) {
    const $ctrl = this;
    const $str_limit = $filter('str_limit');
    const $translate = $filter('translate');

    const onStateChanged = function(promise, action = 'deactivation') {
        promise.then((res) => {
            $ctrl.voucher = res.data.data;
            $ctrl.parseHistory($ctrl.voucher.history);

            switch (action) {
                case 'deactivation': PushNotificationsService.success('Success!', 'Voucher deactivated'); break;
                case 'activation': PushNotificationsService.success('Success!', 'Voucher activated'); break;
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

    $ctrl.showTooltip = (e, target) => {
        e.stopPropagation();
        e.preventDefault();

        $ctrl.history.forEach((history) => {
            history.showTooltip = history === target;
        });
    };

    $ctrl.hideTooltip = (e, target) => {
        e.stopPropagation();
        e.preventDefault();

        $timeout(() => target.showTooltip = false, 0);
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

    $ctrl.dateLocaleFormat = (dateLocale) => {
        return dateLocale ? dateLocale.split('-')[1] || dateLocale : dateLocale;
    }

    $ctrl.parseHistory = (history) => {
        $ctrl.history = history.map((item) => {
            const date = $ctrl.dateLocaleFormat(item.created_at_locale);
            const note_substr = item.note ? $str_limit(item.note, 40) : null;

            return { ...item, date, note_substr };
        });
    };

    $ctrl.fetchVoucher = () => {
        VoucherService.show($ctrl.organization.id, $ctrl.voucher.id).then(((res) => {
            $ctrl.voucher = res.data.data;
            $ctrl.parseHistory($ctrl.voucher.history);
        }));
    };

    $ctrl.$onInit = function() {
        $ctrl.parseHistory($ctrl.voucher.history);
    }
};

module.exports = {
    bindings: {
        voucher: '<',
        organization: '<',
    },
    controller: [
        '$filter',
        '$timeout',
        'ModalService',
        'VoucherService',
        'PhysicalCardsService',
        'PageLoadingBarService',
        'PushNotificationsService',
        VouchersShowComponent
    ],
    templateUrl: 'assets/tpl/pages/vouchers-show.html'
};