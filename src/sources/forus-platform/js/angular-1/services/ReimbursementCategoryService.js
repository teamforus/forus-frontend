const ReimbursementCategoryService = function (ApiRequest) {
    return new (function () {
        this.index = (query = {}) => {
            return ApiRequest.get(`/platform/reimbursement-categories`, query);
        };

        this.show = (id) => {
            return ApiRequest.get(`/platform/reimbursement-categories/${id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    ReimbursementCategoryService,
];
