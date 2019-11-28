let DigIdService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/digid';

    return new(function() {
        this.start = function(fund_id) {
            return ApiRequest.post(apiPrefix, {
                fund_id: fund_id
            });
        };

        this.resolve = function(rid, aselect_credentials) {
            return ApiRequest.post(apiPrefix + '/resolve', {
                rid: rid, 
                aselect_credentials: aselect_credentials,
            });
        };
    });
};

module.exports = [
    'ApiRequest',
    DigIdService
];