let ProductService = function(ApiRequest) {
    let uriPrefix = '/platform/products';

    return new (function() {
        this.list = function(data) {
            return ApiRequest.get(uriPrefix, data);
        };

        this.sample = function() {
            return ApiRequest.get(uriPrefix + '/sample');
        };

        this.read = function(id) {
            return ApiRequest.get(uriPrefix + '/' + id);
        }

        this.request = function(id, data) {
            return ApiRequest.post(uriPrefix + '/' + id + '/request', data);
        }
    });
};

module.exports = [
    'ApiRequest',
    ProductService
];