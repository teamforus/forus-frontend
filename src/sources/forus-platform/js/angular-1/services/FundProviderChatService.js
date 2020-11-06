let sprintf = require('sprintf-js').sprintf;

let FundProviderChatService = function(ApiRequest) {
    let FundProviderChatService = function() {
        let uriPrefix = '/platform/organizations';

        this.list = function(organization_id, fund_id, provider_id, query = {}) {
            return ApiRequest.get(
                sprintf(
                    "%s/%s/funds/%s/providers/%s/chats",
                    uriPrefix,
                    organization_id,
                    fund_id,
                    provider_id
                ),
                query
            );
        };

        this.listMessages = function(organization_id, fund_id, provider_id, chat_id, query = {}) {
            return ApiRequest.get(
                sprintf(
                    "%s/%s/funds/%s/providers/%s/chats/%s/messages",
                    uriPrefix,
                    organization_id,
                    fund_id,
                    provider_id,
                    chat_id
                ),
                query
            );
        };

        this.storeMessage = function(organization_id, fund_id, provider_id, chat_id, query = {}) {
            return ApiRequest.post(
                sprintf(
                    "%s/%s/funds/%s/providers/%s/chats/%s/messages",
                    uriPrefix,
                    organization_id,
                    fund_id,
                    provider_id,
                    chat_id
                ),
                query
            );
        };

        this.store = function(organization_id, fund_id, provider_id, query = {}) {
            return ApiRequest.post(
                sprintf(
                    "%s/%s/funds/%s/providers/%s/chats",
                    uriPrefix,
                    organization_id,
                    fund_id,
                    provider_id
                ),
                query
            );
        };
    };

    return new FundProviderChatService();
};

module.exports = [
    'ApiRequest',
    FundProviderChatService
];