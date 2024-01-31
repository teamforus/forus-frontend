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
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.post(`${uriPrefix}/download-pdf`, data, {}, true, callback);
        };
    });
};

module.exports = [
    'ApiRequest',
    PreCheckService,
];