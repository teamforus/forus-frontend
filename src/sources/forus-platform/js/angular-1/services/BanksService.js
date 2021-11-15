const BanksService = function(ApiRequest) {
    const uriPrefix = '/platform/banks';

    return new(function() {
        this.list = (query = {}) =>  ApiRequest.get(uriPrefix, query);
    });
};

module.exports = [
    'ApiRequest',
    BanksService
];