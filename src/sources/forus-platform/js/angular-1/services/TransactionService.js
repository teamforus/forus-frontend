let TransactionService = function(
    ApiRequest
) {
    return new(function() {
        this.list = function(type, organization_id, query) {
            query = query ? query : {};
            query.per_page = 25;
            return ApiRequest.get(
                '/platform/organizations/' + organization_id + '/' +
                type + '/transactions', query
            );
        };

        this.show = function(type, organization_id, address) {
            return ApiRequest.get(
                '/platform/organizations/' + organization_id + '/' +
                type + '/transactions/' + address
            );
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionService
];