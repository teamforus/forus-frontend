let ProductService = function(ApiRequest) {
    let uriPrefix = '/platform/products';

    return new (function() {
        this.list = function(values = {}) {
            return ApiRequest.get(uriPrefix, values);
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