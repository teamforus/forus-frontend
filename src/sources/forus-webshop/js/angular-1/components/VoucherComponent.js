const VoucherComponent = function(
    $sce,
    $state,
    $rootScope,
    VoucherService,
    PrintableService,
    ModalService,
    HelperService
) {
    const $ctrl = this;

    $ctrl.qrValue = null;

    $ctrl.mapOptions = {
        centerType: 'avg',
    };

    $ctrl.dismissPhysicalCard = () => {
        localStorage.setItem($ctrl.voucher.fund_id + '_physicalCardDismised', true);
        $ctrl.showPhysicalCardsOption =
            $ctrl.physicalCardIsLinkable() && !$ctrl.isPhysicalCardDismissed();
    };

    $ctrl.isPhysicalCardDismissed = () => {
        return localStorage.getItem($ctrl.voucher.fund_id + '_physicalCardDismised') || false
    };

    $ctrl.deleteVoucher = function(voucher) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'Annuleer reservering',
            icon: 'voucher-apply',
            description: 'voucher.delete_voucher.popup_form.description',
            confirmBtnText: 'voucher.delete_voucher.buttons.submit',
            cancelBtnText: 'voucher.delete_voucher.buttons.close',
            confirm: () => VoucherService.destroy(voucher.address).then(() => $state.go('vouchers'))
        })
    }

    $ctrl.printQrCode = () => {
        const { voucher } = $ctrl;
        const organization = !voucher.product ? voucher.fund.organization : voucher.product.organization;

        PrintableService.open('voucherQrCode', { voucher, organization });
    }

    $ctrl.sendVoucherEmail = function(voucher) {
        return ModalService.open('modalNotification', {
            type: 'confirm',
            title: "E-mail naar mij",
            description: "Stuur de QR-code naar mijn e-mailadres",
            confirm: () => {
                VoucherService.sendToEmail(voucher.address).then(res => {
                    const emailServiceUrl = HelperService.getEmailServiceProviderUrl($rootScope.auth_user.email);

                    ModalService.open('modalNotification', {
                        type: 'action-result',
                        class: 'modal-description-pad',
                        title: 'popup_auth.labels.voucher_email',
                        description: 'popup_auth.notifications.voucher_email',
                        confirmBtnText: emailServiceUrl ? 'email_service_switch.confirm' : 'buttons.close',
                        confirm: () => HelperService.openInNewTab(emailServiceUrl)
                    });
                });
            }
        });
    };

    $ctrl.openInMeModal = () => {
        return ModalService.open('modalOpenInMe', {});
    };

    $ctrl.shareVoucher = function(voucher) {
        return ModalService.open('modalShareVoucher', { voucher });
    };

    $ctrl.deactivateVoucher = function(voucher) {
        return ModalService.open('deactivateVoucher', {
            voucher: voucher,
            onDeactivated: (voucher) => $ctrl.setVoucher(voucher),
        });
    };

    $ctrl.usePhysicalCard = (voucher, state, preffersPlasticCard = false) => {
        ModalService.open('modalPhysicalCardType', {
            voucher: voucher,
            state: state,
            preffersPlasticCard: preffersPlasticCard,
            sendVoucherEmail: () => $ctrl.sendVoucherEmail(voucher),
            openInMeModal: $ctrl.openInMeModal,
            printQrCode: $ctrl.printQrCode,
            physicalCardIsLinkable: () => $ctrl.physicalCardIsLinkable(),
            onAttached: () => $ctrl.fetchVoucher()
        });
    };

    $ctrl.setVoucher = (voucher) => {
        $ctrl.voucher = voucher;
        $ctrl.$onInit();
    };

    $ctrl.fetchVoucher = () => {
        VoucherService.get($ctrl.voucher.address).then((res) => $ctrl.setVoucher(res.data.data));
    };

    $ctrl.unlinkPhysicalCard = (voucher) => {
        ModalService.open('modalPhysicalCardUnlink', {
            voucher: voucher,
            onClose: (requestNew) => {
                VoucherService.get($ctrl.voucher.address).then(res => {
                    $ctrl.voucher = res.data.data;
                    $ctrl.$onInit();

                    if (requestNew) {
                        $ctrl.usePhysicalCard($ctrl.voucher, 'select_type', true);
                    }
                });
            },
        });
    };

    $ctrl.physicalCardIsLinkable = () => {
        return $ctrl.voucher.fund.allow_physical_cards && ($ctrl.voucher.type === 'regular');
    }

    $ctrl.$onInit = function() {
        $ctrl.qrValue = $ctrl.voucher.address;
        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);
        $ctrl.voucherCard.description = $sce.trustAsHtml($ctrl.voucherCard.description);
        $ctrl.qrCodeValue = $ctrl.voucher.address;
        $ctrl.voucherCanUse = !$ctrl.voucher.expired;

        $ctrl.showHistory = $ctrl.voucher.history.filter((history) => {
            return !history.event.startsWith('created_');
        }).length > 0;

        $ctrl.isPhysicalCardLinkable = $ctrl.physicalCardIsLinkable();
        $ctrl.showPhysicalCardsOption =
            $ctrl.physicalCardIsLinkable() &&
            !$ctrl.voucher.physical_card &&
            !$ctrl.isPhysicalCardDismissed() &&
            $ctrl.voucherCanUse;
    };
};

module.exports = {
    bindings: {
        voucher: '<',
        products: '<',
        subsidies: '<',
    },
    controller: [
        '$sce',
        '$state',
        '$rootScope',
        'VoucherService',
        'PrintableService',
        'ModalService',
        'HelperService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};
