let FundProviderProductComponent = function(
    FundService,
    ModalService,
    FundProviderChatService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.updateAllowBudgetItem = function(fundProvider, product) {
        FundService.updateProvider(
            fundProvider.fund.organization_id,
            fundProvider.fund.id,
            fundProvider.id, {
                enable_products: product.allowed ? [
                    product.id
                ] : [],
                disable_products: !product.allowed ? [
                    product.id
                ] : []
            }
        ).then((res) => {
            PushNotificationsService.success('Opgeslagen!');
            $ctrl.fundProvider = res.data.data;
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
            },
            onClose: () => {

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

    $ctrl.$onInit = function() {
        $ctrl.fundProviderProductChat = $ctrl.fundProviderProductChats[0] || null;
        $ctrl.product.allowed = $ctrl.fundProvider.products.indexOf(
            $ctrl.product.id
        ) !== -1;
    };
};

module.exports = {
    bindings: {
        organization: '<',
        fundProvider: '<',
        fundProviderProductChats: '<',
        fund: '<',
        product: '<'
    },
    controller: [
        'FundService',
        'ModalService',
        'FundProviderChatService',
        'PushNotificationsService',
        FundProviderProductComponent
    ],
    templateUrl: 'assets/tpl/pages/fund-provider-product.html'
};