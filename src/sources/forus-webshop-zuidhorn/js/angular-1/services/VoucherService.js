module.exports = [
    'ApiRequest',
    function(
        ApiRequest
    ) {
        let apiPrefix = '/platform/vouchers';

        return new (function() {
            this.list = function() {
                return ApiRequest.get(apiPrefix);
            };

            this.get = function(address) {
                return ApiRequest.get(apiPrefix + '/' + address);
            }

            this.getAsProvider = function(address) {
                return ApiRequest.get(apiPrefix + '/' + address + '/provider');
            }

            this.makeTransaction = function(address, values) {
                return ApiRequest.post(apiPrefix + '/' + address + '/transactions', values);
            }
        });
    }
];