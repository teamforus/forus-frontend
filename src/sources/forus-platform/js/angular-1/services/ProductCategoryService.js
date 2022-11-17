const ProductCategoryService = function (ApiRequest) {
    return new (function () {
        this.list = function (query = {}) {
            return ApiRequest.get(`/platform/product-categories`, query);
        };

        this.show = function (id, query = {}) {
            return ApiRequest.get(`/platform/product-categories/${id}`, query);
        };

        this.listAll = function () {
            return ApiRequest.get(`/platform/product-categories`, { all: true });
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductCategoryService,
];