const ProductReservationService = function(ApiRequest) {
    const uriPrefix = '/platform/product-reservations';

    return new (function() {
        this.list = function(data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.read = function(id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.validate = function(data) {
            return ApiRequest.post(uriPrefix + '/validate', data);
        }

        this.reserve = function(data) {
            return ApiRequest.post(uriPrefix, data);
        }

        this.destroy = function(id = {}) {
            return ApiRequest.delete(`${uriPrefix}/${id}`);
        }
    });
};

module.exports = [
    'ApiRequest',
    ProductReservationService
];