const FundProviderProductComponent = function (
    $q,
    $stateParams,
    FundService,
    ModalService,
    PageLoadingBarService,
    FundProviderChatService,
    PushNotificationsService,
) {
    const $ctrl = this;

    $ctrl.deal = null;

    $ctrl.confirmDangerAction = (title, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
        return $q((resolve) => {
            ModalService.open("dangerZone", {
                ...{ title, description_text, cancelButton, confirmButton, text_align: 'center' },
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
            });
        });
    }

    $ctrl.disableProductItem = function (fundProvider, product) {
        FundService.stopActionConfirmationModal(() => {
            product.allowed = false;
            $ctrl.updateAllowBudgetItem(fundProvider, product);
        });
    };

    $ctrl.updateAllowBudgetItem = function (fundProvider, product) {
        const enable_products = product.allowed ? [{ id: product.id }] : [];
        const disable_products = !product.allowed ? [product.id] : [];

        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id,
            { enable_products, disable_products }
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;
            $ctrl.updateProviderProduct(res.data.data);
            $ctrl.$onInit();
        }, console.error);
    };

    $ctrl.makeChat = () => {
        ModalService.open('fundProviderChatMessage', {
            organization_id: $ctrl.organization.id,
            fund_id: $ctrl.fund.id,
            fund_provider_id: $ctrl.fundProvider.id,
            product_id: $ctrl.product.id,
            submit: (fundProviderProductChat) => {
                $ctrl.fundProviderProductChat = fundProviderProductChat;
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.showTheChat();
            }
        });
    };

    $ctrl.loadChat = () => {
        FundProviderChatService.list(
            $ctrl.organization.id,
            $ctrl.fund.id,
            $ctrl.fundProvider.id, {
            product_id: $ctrl.product.id
        }
        ).then((res) => {
            $ctrl.fundProviderProductChats = res.data.data;
            $ctrl.$onInit();
        });
    };

    $ctrl.showTheChat = () => {
        if (!$ctrl.fundProviderProductChat) {
            return;
        }

        ModalService.open('fundProviderChatSponsor', {
            organization_id: $ctrl.organization.id,
            fund_id: $ctrl.fund.id,
            fund_provider_id: $ctrl.fundProvider.id,
            fund_provider_chat_id: $ctrl.fundProviderProductChat.id,
            product: $ctrl.product,
            onClose: $ctrl.loadChat,
        });
    };

    $ctrl.updateProviderProduct = (fundProvider) => {
        $ctrl.fundProvider = fundProvider;

        return FundService.getProviderProduct(
            $stateParams.organization_id,
            $stateParams.fund_id,
            $stateParams.fund_provider_id,
            $stateParams.product_id,
        ).then((res) => {
            $ctrl.product = res.data.data;
            $ctrl.updateProductMeta();
        });
    };

    $ctrl.onCancel = () => {
        $ctrl.deal = null;
    };

    $ctrl.onUpdate = (fundProvider) => {
        $ctrl.updateProviderProduct(fundProvider).then(() => {
            $ctrl.onCancel();
            PushNotificationsService.success("Het aanbod is goedgekeurd.");
        });
    };

    $ctrl.resetLimits = (deal) => {
        $ctrl.confirmDangerAction('Limiet verwijderen?', [
            'U staat op het punt limieten van het aanbod te verwijderen, hiermee wordt het aanbod niet uit de webshop verwijderd.',
            "In plaats daarvan wordt het totale limiet, limiet per tegoed en de vervaldatum van het aanbod verwijderd.\n\n",
            'Wilt u het aabod van de webshop verwijderen? Sluit dan dit venster en gebruik de schakelaar in het bovenste gedeelte van deze pagina.'
        ].join(" ")).then((confirmed = false) => {
            if (!confirmed) {
                return;
            }

            FundService.updateProvider($ctrl.fund.organization_id, $ctrl.fund.id, $ctrl.fundProvider.id, {
                reset_products: [{ id: deal.product_id }]
            }).then(
                (res) => $ctrl.updateProviderProduct(res.data.data).then(() => PushNotificationsService.success("De limieten zijn hersteld.")),
                (res) => PushNotificationsService.danger("Foutmelding!", res.data.message),
            ).finally(() => {
                $ctrl.deal = null;
                PageLoadingBarService.setProgress(100);
            });
        });
    };

    $ctrl.updateProductMeta = () => {
        $ctrl.product.allowed = $ctrl.fundProvider.products.indexOf($ctrl.product.id) !== -1;
        $ctrl.product.approvedActionParams = { ...$stateParams };
        $ctrl.product.editParams = { ...$stateParams };
        $ctrl.product.hasLimits = $ctrl.product.deals_history.filter((deal) => deal.active).length > 0;

        if ($ctrl.product.deals_history && Array.isArray($ctrl.product.deals_history)) {
            $ctrl.product.deals_history = $ctrl.product.deals_history.map(deal => ({
                ...deal, showSubsidyDealParams: { ...$stateParams, ...{ deal_id: deal.id } }
            }));
        }
    };

    $ctrl.$onInit = function () {
        $ctrl.fundProviderProductChat = $ctrl.fundProviderProductChats[0] || null;
        $ctrl.updateProductMeta();
    };
};

module.exports = {
    bindings: {
        fund: '<',
        product: '<',
        organization: '<',
        fundProvider: '<',
        fundProviderProductChats: '<',
    },
    controller: [
        '$q',
        '$stateParams',
        'FundService',
        'ModalService',
        'PageLoadingBarService',
        'FundProviderChatService',
        'PushNotificationsService',
        FundProviderProductComponent,
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-product.html',
};