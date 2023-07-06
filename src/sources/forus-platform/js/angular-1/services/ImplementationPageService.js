const ImplementationPageService = function (ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.list = (organization_id, id, query = {}) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${id}/pages`, query);
        };

        this.store = (organization_id, id, data = {}) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/implementations/${id}/pages`, data);
        };

        this.read = (organization_id, id, page_key) => {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${id}/pages/${page_key}`);
        };

        this.update = (organization_id, id, page_id, data) => {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/implementations/${id}/pages/${page_id}`, data);
        };

        this.destroy = (organization_id, id, page_id) => {
            return ApiRequest.delete(`${uriPrefix}${organization_id}/implementations/${id}/pages/${page_id}`);
        };

        this.validateBlocks = (organization_id, id, data = {}) => {
            return ApiRequest.post(`${uriPrefix}${organization_id}/implementations/${id}/pages/validate-blocks`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    ImplementationPageService
];