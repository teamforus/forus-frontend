let DemoTransactionService = function(ApiRequest) {
    let uriPrefix = '/platform/demo/transactions';

    return new (function() {
        this.store = function() {
            return ApiRequest.post(
                uriPrefix
            );
        };

        this.update = function(token, values) {
            return ApiRequest.patch(
                uriPrefix + '/' + token, values
            );
        };

        this.read = function(token) {
            return ApiRequest.get(
                uriPrefix + '/' + token,
            );
        }
    });
}

module.exports = [
    'ApiRequest',
    DemoTransactionService
];
