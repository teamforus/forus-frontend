const BIConnectionService = function(ApiRequest) {
    const prefix = '/platform/organizations';

    return new (function() {
        this.active = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connections/active`);
        };

        this.store = function(organization_id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/bi-connections`, this.apiFormToResource(data));
        };

        this.update = function (organization_id, id, data) {
            return ApiRequest.patch(`${prefix}/${organization_id}/bi-connections/${id}`, this.apiFormToResource(data));
        }

        this.resetToken = function(organization_id, id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connections/${id}/reset`);
        };

        this.availableDataTypes = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connections/data-types`);
        };

        this.apiFormToResource = function (formData) {
            return JSON.parse(JSON.stringify(formData));
        };

        this.apiResourceToForm = function (apiResource) {
            return { ...apiResource };
        };

    });
};

module.exports = [
    'ApiRequest',
    BIConnectionService,
];