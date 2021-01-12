let PrevalidationService = function(
    ApiRequest
) {
    let uriPrefix = '/platform';

    return new(function() {
        this.submitData = function(data, fund_id = null) {
            return ApiRequest.post(uriPrefix + '/prevalidations', {
                data: data,
                fund_id: fund_id
            });
        };

        this.list = function(data) {
            return ApiRequest.get(uriPrefix + '/prevalidations');
        }

        this.read = function(code) {
            return ApiRequest.get(uriPrefix + '/prevalidations/' + code);
        };
    });
};

module.exports = [
    'ApiRequest',
    PrevalidationService
];