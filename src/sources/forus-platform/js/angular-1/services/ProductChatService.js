let sprintf = require('sprintf-js').sprintf;

let ProductChatService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations';

    let ProductChatService = function() {
        this.list = function(organization_id, product_id, query = {}) {
            return ApiRequest.get(sprintf(
                "%s/%s/products/%s/chats",
                uriPrefix,
                organization_id,
                product_id
            ), query);
        };

        this.show = function(organization_id, product_id, chat_id, query = {}) {
            return ApiRequest.post(sprintf(
                "%s/%s/products/%s/chats/%s",
                uriPrefix,
                organization_id,
                product_id,
                chat_id
            ), query);
        };

        this.listMessages = function(organization_id, product_id, chat_id, query = {}) {
            return ApiRequest.get(
                sprintf(
                    "%s/%s/products/%s/chats/%s/messages",
                    uriPrefix,
                    organization_id,
                    product_id,
                    chat_id
                ),
                query
            );
        };

        this.storeMessage = function(organization_id, product_id, chat_id, query = {}) {
            return ApiRequest.post(
                sprintf(
                    "%s/%s/products/%s/chats/%s/messages",
                    uriPrefix,
                    organization_id,
                    product_id,
                    chat_id
                ),
                query
            );
        };
    };

    return new ProductChatService();
};

module.exports = [
    'ApiRequest',
    ProductChatService
];