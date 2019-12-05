let sprintf = require('sprintf-js').sprintf;

let DigIdService = function(
    ApiRequest,
    appConfigs
) {
    let apiPrefix = '/platform/digid';

    return new(function() {
        this.start = function(fund_id) {
            return ApiRequest.post(apiPrefix, {
                fund_id: fund_id,
                redirect_type: 'fund_request'
            });
        };

        this.getRedirecturl = (session_uid) => {
            return sprintf('%s%s/%s/redirect', 
                appConfigs.api_url,
                apiPrefix,
                session_uid,
            );
        }

        /* this.resolve = function(rid, aselect_credentials) {
            return ApiRequest.post(apiPrefix + '/resolve', {
                rid: rid, 
                aselect_credentials: aselect_credentials,
            });
        }; */
    });
};

module.exports = [
    'ApiRequest',
    'appConfigs',
    DigIdService
];