const ProductReservationService = function (ApiRequest) {
    const uriPrefix = '/platform/product-reservations';

    return new (function () {
        this.list = function (data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.read = function (id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.validateClient = function (data) {
            return ApiRequest.post(uriPrefix + '/validate-client', data);
        }

        this.validateAddress = function (data) {
            return ApiRequest.post(uriPrefix + '/validate-address', data);
        }

        this.reserve = function (data) {
            return ApiRequest.post(uriPrefix, data);
        }

        this.update = function (id, values = {}) {
            return ApiRequest.patch(`${uriPrefix}/${id}`, values);
        }
    });
};

module.exports = [
    'ApiRequest',
    ProductReservationService,
];