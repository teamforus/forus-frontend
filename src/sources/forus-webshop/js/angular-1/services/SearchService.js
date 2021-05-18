const SearchService = function(ApiRequest) {
    return new (function() {
        this.search = (query) => ApiRequest.get('/platform/search', {...query});
    });
};

module.exports = [
    'ApiRequest', 
    SearchService
];