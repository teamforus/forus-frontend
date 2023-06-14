const ReimbursementCategoryService = function (ApiRequest) {
    return new (function () {
        this.index = (organization_id, query = {}) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursement-categories`, query);
        };

        this.show = (organization_id, id) => {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reimbursement-categories/${id}`);
        };

        this.update = (organization_id, id, data) => {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/reimbursement-categories/${id}`, data);
        };

        this.store = (organization_id, data) => {
            return ApiRequest.post(`/platform/organizations/${organization_id}/reimbursement-categories`, data);
        };

        this.destroy = (organization_id, id) => {
            return ApiRequest.delete(`/platform/organizations/${organization_id}/reimbursement-categories/${id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    ReimbursementCategoryService,
];
