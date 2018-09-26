let ProductService = function(ApiRequest) {
    let uriPrefix = '/platform/products';

    return new (function() {
        this.list = function() {
            return ApiRequest.get(uriPrefix);
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