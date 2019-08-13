let ValidatorRequestService = function(ApiRequest) {
    let uriPrefix = '/platform/validator/validator-requests';

    return new (function() {
        this.index = function(data = {}) {
            return ApiRequest.get(uriPrefix, data);
        };

        this.read = function(id) {
            return ApiRequest.get(
                uriPrefix + '/' + id
            );
        }

        this.approve = function(id) {
            return ApiRequest.patch(
                uriPrefix + '/' + id, {
                    state: 'approved'
                }
            );
        };

        this.decline = function(id) {
            return ApiRequest.patch(
                uriPrefix + '/' + id, {
                    state: 'declined'
                }
            );
        };
    });
};

module.exports = [
    'ApiRequest',
    ValidatorRequestService
];