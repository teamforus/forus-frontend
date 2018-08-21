let PrevalidationService = function(ApiRequest) {
    let uriPrefix = '/platform';

    return new(function() {
        this.submitData = function(data) {
            return ApiRequest.post(uriPrefix + '/prevalidations', {
                data: data
            });
        };

        this.list = function(data) {
            return ApiRequest.get(uriPrefix + '/prevalidations');
        }
    });
};

module.exports = [
    'ApiRequest',
    PrevalidationService
];