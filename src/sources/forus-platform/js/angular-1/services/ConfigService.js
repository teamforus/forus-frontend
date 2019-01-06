module.exports = [
    'ApiRequest',
    'appConfigs',
    function(
        ApiRequest,
        appConfigs
    ) {
        let apiPrefix = '/platform/config';

        return new(function() {
            this.get = function(type) {
                return ApiRequest.get(apiPrefix + '/' + (type || 'webshop'));
            }

            this.getFlag = function(key, fallback = false) {
                if (typeof appConfigs.flags[key] != 'undefined') {
                    return appConfigs.flags[key];
                }

                return fallback;
            }
        });
    }
];