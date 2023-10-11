const ProductReservationService = function (ApiRequest, DateService) {
    const uriPrefix = '/platform/product-reservations';

    return new (function () {
        this.list = function (data) {
            return ApiRequest.get(uriPrefix, data);
        }

        this.read = function (id) {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        }

        this.validate = function (data) {
            return ApiRequest.post(uriPrefix + '/validate', this.apiFormToResource(data));
        }

        this.reserve = function (data) {
            return ApiRequest.post(uriPrefix, this.apiFormToResource(data));
        }

        this.update = function (id, values = {}) {
            return ApiRequest.patch(`${uriPrefix}/${id}`, this.apiFormToResource(values));
        }

        this.apiFormToResource = function(formData) {
            if (formData.birth_date) {
                return { ...formData, birth_date:  DateService._frontToBack(formData.birth_date) };
            }

            return formData;
        };
    });
};

module.exports = [
    'ApiRequest',
    'DateService',
    ProductReservationService,
];