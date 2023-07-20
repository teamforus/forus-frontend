const OrganizationContactService = function(ApiRequest) {
    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/contacts`, query);
        };

        this.store = function(organization_id, data) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/contacts`, data);
        };

        this.available = function(organization_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/contacts/available`);
        };
    });
};

module.exports = [
    'ApiRequest',
    OrganizationContactService
];