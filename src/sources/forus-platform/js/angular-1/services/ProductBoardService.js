const ProductBoardService = function(ApiRequest) {
    const uriPrefix = '/platform/productboard';

    return new (function() {
        this.store = (data) => {
            return ApiRequest.post(uriPrefix, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductBoardService,
];