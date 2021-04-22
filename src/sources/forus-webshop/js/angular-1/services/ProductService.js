let ProductService = function(
    ApiRequest
) {
    let uriPrefix = '/platform/products';

    return new (function() {
        this.list = function(data) {
            return ApiRequest.get(uriPrefix, data);
        };

        this.sample = function(fund_type, per_page = 6) {
            return ApiRequest.get(uriPrefix + '/sample', { fund_type, per_page });
        };

        this.read = function(id) {
            return ApiRequest.get(uriPrefix + '/' + id);
        }
    });
};

module.exports = [
    'ApiRequest',
    ProductService
];