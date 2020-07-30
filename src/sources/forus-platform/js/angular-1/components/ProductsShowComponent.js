let ProductsShowComponent = function(
    $sce,
    $state,
    $filter,
    ModalService,
    ProductService,
    ProductChatService
) {
    let $ctrl = this;
    let $translate = $filter('translate');

    let trans_product_edit = (key) => {
        return $translate('product_edit.labels.' + key);
    };

    $ctrl.filters = {
        values: {},
    };

    $ctrl.$onInit = function() {
        $ctrl.cardLevel = "show";
        $ctrl.product.description_html = $sce.trustAsHtml(
            $ctrl.product.description_html
        );

        $ctrl.product.description_amount = $ctrl.product.unlimited_stock ? 
            trans_product_edit('unlimited') : $ctrl.product.stock_amount;

        $ctrl.mapFundsWithChats();
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
        ).then(res => $ctrl.funds = res.data, console.error);
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
        '$filter',
        'ModalService',
        'ProductService',
        'ProductChatService',
        ProductsShowComponent
    ],
    templateUrl: 'assets/tpl/pages/products-show.html'
};