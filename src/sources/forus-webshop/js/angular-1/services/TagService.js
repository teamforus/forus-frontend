const TagService = function(ApiRequest) {
    const uriPrefix = '/platform/tags';

    return new (function() {
        this.list = (filters = {}) => {
            return ApiRequest.get(uriPrefix, filters);
        };

        this.show = (id) => {
            return ApiRequest.get(`${uriPrefix}/${id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    TagService
];