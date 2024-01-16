const BIConnectionService = function(ApiRequest) {
    const prefix = '/platform/organizations';

    return new (function() {
        this.active = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connection`);
        };

        this.store = function(organization_id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/bi-connection`, data);
        };

        this.update = function (organization_id, data) {
            return ApiRequest.patch(`${prefix}/${organization_id}/bi-connection`, data);
        }

        this.resetToken = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connection/reset`);
        };

        this.availableDataTypes = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/bi-connection/data-types`);
        };
    });
};

module.exports = [
    'ApiRequest',
    BIConnectionService,
];