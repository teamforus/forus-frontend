const ProductCategoryService = function (ApiRequest) {
    return new (function () {
        this.list = function (query = {}) {
            return ApiRequest.get(`/platform/product-categories`, query);
        };

        this.show = function (id, query = {}) {
            return ApiRequest.get(`/platform/product-categories/${id}`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductCategoryService,
];