let ProvidersService = function(
    ApiRequest
) {
    return new(function() {
        this.search = function(query = {}) {
            return ApiRequest.get('/platform/providers', query);
        };

        this.read = function(id) {
            return ApiRequest.get('/platform/providers/' + id);
        };
    });
};

module.exports = [
    'ApiRequest',
    ProvidersService
];