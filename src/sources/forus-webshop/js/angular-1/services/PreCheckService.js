const PreCheckService = function(ApiRequest) {
    const uriPrefix = '/platform/pre-checks';

    return new (function() {
        this.list = function(query = {}) {
            return ApiRequest.get(uriPrefix, query);
        };

        this.read = function(pre_check_id) {
            return ApiRequest.get(`${uriPrefix}/${pre_check_id}`);
        };

        this.calculateTotals = function(data) {
            return ApiRequest.post(`${uriPrefix}/calculate-totals`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    PreCheckService
];