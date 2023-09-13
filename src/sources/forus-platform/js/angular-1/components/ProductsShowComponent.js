const ProductsShowComponent = function(
    $sce,
    $state,
    ModalService,
    ProductService,
    ProductChatService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {},
    };

    $ctrl.fund_toggles = {};

    $ctrl.$onInit = function() {
        $ctrl.product.description_html = $sce.trustAsHtml($ctrl.product.description_html);

        $ctrl.mapFundsWithChats();
        $ctrl.updateFundToggles($ctrl.funds);
        $ctrl.emptyFundsLink = $state.href('provider-funds', {
            organization_id: $ctrl.product.organization_id,
        });
    };

    $ctrl.mapFundsWithChats = () => {
        $ctrl.funds.data.forEach(fund => {
            fund.chat = $ctrl.chats.data.filter(
                chat => fund.id == chat.fund_id
            )[0] || null;
        });
    };

    $ctrl.showTheChat = (fund) => {
        if (!fund.chat) {
            return;
        }

        ModalService.open('fundProviderChatProvider', {
            organization_id: $ctrl.product.organization_id,
            product_id: $ctrl.product.id,
            chat_id: fund.chat.id,
            product: $ctrl.product,
            sponsor_name: fund.organization.name,
            onClose: $ctrl.loadChats
        });
    };

    $ctrl.loadChats = () => {
        ProductChatService.list(
            $ctrl.product.organization_id,
            $ctrl.product.id, {
            per_page: 100
        }).then(res => {
            $ctrl.chats = res.data;
            $ctrl.mapFundsWithChats();
        });
    };

    $ctrl.onPageChange = async (query) => {
        let _query = Object.assign({}, query, $ctrl.filters.values);

        delete _query.organization_id;

        ProductService.listProductFunds(
            $ctrl.product.organization_id,
            $ctrl.product.id,
            _query
        ).then(res => $ctrl.updateFundToggles($ctrl.funds = res.data), console.error);
    };

    $ctrl.updateFundToggles = (funds) => {
        let excluded_funds = $ctrl.product.excluded_funds.map(fund => fund.id);

        funds.data.forEach(function(fund) {
            $ctrl.fund_toggles[fund.id] = excluded_funds.indexOf(fund.id) === -1;
        });
    };

    $ctrl.changeFundExclusion = (fund, is_available) => {
        let values = is_available ? {
            enable_funds: [fund.id]
        } : { disable_funds: [fund.id] };

        ProductService.updateExclusions(
            $ctrl.product.organization_id,
            $ctrl.product.id,
            values
        ).then(function() {
            PushNotificationsService.success('Opgeslagen!');
        }, function() {
            PushNotificationsService.success('Fout! Er ging iets mis.');
        });
    };

    $ctrl.deleteProduct = function(product) {
        ModalService.open('modalNotification', {
            type: 'confirm',
            title: 'products.confirm_delete.title',
            description: 'products.confirm_delete.description',
            icon: 'product-create',
            confirm: () => {
                ProductService.destroy(
                    product.organization_id,
                    product.id
                ).then(() => $state.go('products', {
                    organization_id: product.organization_id,
                }));
            }
        });
    };
};

module.exports = {
    bindings: {
        product: '<',
        funds: '<',
        chats: '<',
    },
    controller: [
        '$sce',
        '$state',
        'ModalService',
        'ProductService',
        'ProductChatService',
        'PushNotificationsService',
        ProductsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/products-show.html'
};