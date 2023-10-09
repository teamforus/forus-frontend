const sprintf = require('sprintf-js').sprintf;

const FundRequestService = function(ApiRequest) {
    const uriPrefix = '/platform/funds/%s/requests';
    const uriRequesterPrefix = '/platform/fund-requests';

    return new(function() {
        this.index = function(fund_id, data = {}) {
            return ApiRequest.get(sprintf(uriPrefix, fund_id), data);
        };

        this.store = function(fund_id, data) {
            return ApiRequest.post(sprintf(uriPrefix, fund_id), data);
        }

        this.storeValidate = function(fund_id, data) {
            return ApiRequest.post(sprintf(`${uriPrefix}/validate`, fund_id), data);
        }

        this.read = function(fund_id, request_id) {
            return ApiRequest.patch(sprintf(uriPrefix, fund_id, request_id));
        }

        this.indexRequester = function(data = {}) {
            return ApiRequest.get(uriRequesterPrefix, data);
        };

        this.readRequester = function(id) {
            return ApiRequest.get(`${uriRequesterPrefix}/${id}`);
        }
    });
};

module.exports = [
    'ApiRequest',
    FundRequestService,
];