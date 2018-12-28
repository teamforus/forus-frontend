let PrevalidationService = function(ApiRequest) {
    let uriPrefix = '/platform';

    return new (function() {
        this.submitData = function(data, fund_id = null) {
            return ApiRequest.post(uriPrefix + '/prevalidations', {
                data: data,
                fund_id: fund_id
            });
        };

        this.list = function(filters) {
            return ApiRequest.get(uriPrefix + '/prevalidations', filters);
        }

        this.read = function(code) {
            return ApiRequest.get(uriPrefix + '/prevalidations/' + code);
        };

        this.redeem = function(code) {
            return ApiRequest.post(uriPrefix + '/prevalidations/' + code + '/redeem');
        };
    });
};

module.exports = [
    'ApiRequest',
    PrevalidationService
];