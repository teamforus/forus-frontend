let BusinessTypeService = function(
    ApiRequest
) {
    return new (function() {
        let url = '/platform/business-types';

        this.list = function(query = {}) {
            return ApiRequest.get(`${url}`, query);
        };
        
        this.show = function(id, query = {}) {
            return ApiRequest.get(`${url}/` + id, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    BusinessTypeService
];