const PreCheckService = function (ApiRequest) {
    const uriPrefix = '/platform/pre-checks';

    return new (function () {
        this.list = function (query = {}) {
            return ApiRequest.get(uriPrefix, query);
        };

        this.calculateTotals = function (data) {
            return ApiRequest.post(`${uriPrefix}/calculate`, data);
        };

        this.downloadPDF = function (data) {
            return ApiRequest.post(`${uriPrefix}/download-pdf`, data, {}, true, {
                cache: false,
                responseType: 'arraybuffer'
            });
        };
    });
};

module.exports = [
    'ApiRequest',
    PreCheckService,
];