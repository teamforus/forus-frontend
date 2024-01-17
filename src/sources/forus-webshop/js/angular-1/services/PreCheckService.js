const PreCheckService = function (ApiRequest) {
    const uriPrefix = '/platform/pre-checks';

    return new (function () {
        this.list = function (query = {}) {
            return ApiRequest.get(uriPrefix, query);
        };

        this.calculateTotals = function (data) {
            return ApiRequest.post(`${uriPrefix}/calculate`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    PreCheckService,
];