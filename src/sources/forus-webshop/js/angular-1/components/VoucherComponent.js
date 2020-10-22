let VoucherComponent = function(
    $state,
    $sce,
    VoucherService,
    PrintableService,
    ModalService
) {
    let $ctrl = this;

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
            confirm: () => {
                VoucherService.destroy(
                    voucher.address
                ).then(function(res) {
                    $state.go('vouchers')
                })
            }
        })
    }

    $ctrl.printQrCode = () => {
        $ctrl.organization = !$ctrl.voucher.product ?
            $ctrl.voucher.fund.organization : $ctrl.voucher.product.organization;

        PrintableService.open('voucherQrCode', {
            voucher: $ctrl.voucher,
            organization: $ctrl.organization,
        });
    }

    $ctrl.sendVoucherEmail = function(voucher) {
        return ModalService.open('modalNotification', {
            type: 'confirm',
            title: "E-Mail voucher naar uzelf",
            description: "U kunt uw voucher naar uzelf mailen. Laat de voucher, in de vorm van een QR-code, aan de aanbieder zien vanuit uw vertrouwde e-mailbox.",
            confirm: () => {
                VoucherService.sendToEmail(voucher.address).then(res => {
                    ModalService.open('modalNotification', {
                        type: 'action-result',
                        class: 'modal-description-pad',
                        title: 'popup_auth.labels.voucher_email',
                        description: 'popup_auth.notifications.voucher_email',
                        confirmBtnText: 'popup_auth.buttons.confirm'
                    });
                });
            }
        });
    };

    $ctrl.openInMeModal = () => {
        return ModalService.open('modalOpenInMe', {});
    };

    $ctrl.shareVoucher = function(voucher) {
        return ModalService.open('modalShareVoucher', {
            voucher: voucher
        });
    };

    $ctrl.usePhysicalCard = (voucher) => {
        if (!voucher.physical_card) {
            ModalService.open('modalPhysicalCardType', {
                voucher: voucher,
                sendVoucherEmail: () => $ctrl.sendVoucherEmail(voucher),
                openInMeModal: $ctrl.openInMeModal,
                printQrCode: $ctrl.printQrCode,
                onAttached: () => {
                    VoucherService.get($ctrl.voucher.address).then(res => {
                        $ctrl.voucher = res.data.data;
                        $ctrl.$onInit();
                    });
                }
            });
        } else {
            ModalService.open('modalPhysicalCardUnlink', {
                voucher: voucher,
                onClose: (requestNew) => {
                    VoucherService.get($ctrl.voucher.address).then(res => {
                        $ctrl.voucher = res.data.data;
                        $ctrl.$onInit();

                        if (requestNew) {
                            $ctrl.usePhysicalCard($ctrl.voucher);
                        }
                    });
                },
            });
        }
    };

    $ctrl.physicalCardIsLinkable = () => {
        return $ctrl.voucher.fund.allow_physical_cards &&
            ($ctrl.voucher.type === 'regular');
    }

    $ctrl.$onInit = function() {
        $ctrl.qrValue = $ctrl.voucher.address;
        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);
        $ctrl.voucherCard.description = $sce.trustAsHtml($ctrl.voucherCard.description);
        $ctrl.qrCodeValue = $ctrl.voucher.address;
        $ctrl.voucherCanUse = !$ctrl.voucher.expired;

        $ctrl.isPhysicalCardLinkable = $ctrl.physicalCardIsLinkable();
        $ctrl.showPhysicalCardsOption =
            $ctrl.physicalCardIsLinkable() &&
            !$ctrl.voucher.physical_card &&
            !$ctrl.isPhysicalCardDismissed();
    };
};

module.exports = {
    bindings: {
        voucher: '<'
    },
    controller: [
        '$state',
        '$sce',
        'VoucherService',
        'PrintableService',
        'ModalService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};
