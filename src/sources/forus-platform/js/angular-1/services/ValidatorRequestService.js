let ValidatorRequestService = function(ApiRequest) {
    let uriPrefix = '/platform/validator/validator-requests';

    return new (function() {
        this.index = function(data = {}) {
            return ApiRequest.get(uriPrefix, data);
        };

        this.indexGroup = function(data = {}) {
            return ApiRequest.get(uriPrefix, Object.assign(data, {
                group: 1
            }));
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