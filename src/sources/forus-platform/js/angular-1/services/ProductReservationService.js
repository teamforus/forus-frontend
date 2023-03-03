const ProductReservationService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations';

    return new (function() {
        this.list = function(organization_id, data) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations`, data);
        }

        this.store = function(organization_id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations`, { ...data });
        }

        this.storeBatch = function(organization_id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/batch`, { ...data });
        }

        this.read = function(organization_id, id) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/${id}`);
        }

        this.accept = function(organization_id, id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/${id}/accept`, data);
        }

        this.reject = function(organization_id, id, data = {}) {
            return ApiRequest.post(`${uriPrefix}/${organization_id}/product-reservations/${id}/reject`, data);
        }

        this.destroy = function(organization_id, id) {
            return ApiRequest._delete(`${uriPrefix}/${organization_id}/product-reservations/${id}`);
        }

        this.exportFields = function(organization_id) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/export-fields`);
        };

        this.export = (organization_id, data = {}) => {
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`${uriPrefix}/${organization_id}/product-reservations/export`, data, {}, true, callback);
        };

        this.sampleCsvProductReservations = (product_id = '') => {
            const headers = ['number', 'product_id'];
            const values = ['000000000000', product_id];

            return Papa.unparse([headers, values]);
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductReservationService
];