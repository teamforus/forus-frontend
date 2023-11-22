const PreCheckService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = function(organization_id, implementation_id, query = {}) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${implementation_id}/pre-checks`, query);
        };

        this.sync = function(organization_id, implementation_id, data) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/implementations/${implementation_id}/pre-checks/sync`, data);
        };

        this.read = function(organization_id, implementation_id, pre_check_id) {
            return ApiRequest.get(`${uriPrefix}${organization_id}/implementations/${implementation_id}/pre-checks/${pre_check_id}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    PreCheckService
];