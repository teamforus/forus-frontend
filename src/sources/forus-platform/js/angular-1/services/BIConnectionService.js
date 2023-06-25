const BIConnectionService = function(ApiRequest) {
    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/bi-connections`, query);
        };

        this.store = function(organization_id, data = {}) {
            return ApiRequest.post(
                `/platform/organizations/${organization_id}/bi-connections`,
                this.apiFormToResource(data)
            );
        };

        this.show = function(organization_id, connection_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/bi-connections/${connection_id}`);
        };

        this.update = function(organization_id, connection_id, data = {}) {
            return ApiRequest.patch(
                `/platform/organizations/${organization_id}/bi-connections/${connection_id}`,
                this.apiFormToResource(data)
            );
        };

        this.recreate = function(organization_id, data = {}) {
            return ApiRequest.post(
                `/platform/organizations/${organization_id}/bi-connections/recreate`,
                this.apiFormToResource(data)
            );
        };

        this.apiFormToResource = function(formData) {
            return JSON.parse(JSON.stringify(formData));
        };

        this.apiResourceToForm = function(apiResource) {
            return {
                auth_type: apiResource.auth_type || 'header',
            };
        };
    });
};

module.exports = [
    'ApiRequest',
    BIConnectionService
];