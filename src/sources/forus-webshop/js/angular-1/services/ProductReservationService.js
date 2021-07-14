const ProductReservationService = function(ApiRequest) {
    const uriPrefix = '/platform/product-reservations';

    return new (function() {
        this.list = function(data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.read = function(id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.reserve = function(product_id, voucher_address) {
            return ApiRequest.post(uriPrefix, { product_id, voucher_address });
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