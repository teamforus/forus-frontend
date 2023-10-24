const MollieConnectionService = function(ApiRequest) {
    return new (function() {
        this.getConfigured = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/mollie-connections/configured`, query);
        };

        this.store = function(organization_id, data) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/mollie-connections`, data);
        };

        this.connect = function(organization_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/mollie-connections/connect`);
        };

        this.fetch = function(organization_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/mollie-connections/fetch`);
        };

        this.destroy = function (organization_id, id) {
            return ApiRequest.delete(`/platform/organizations/${organization_id}/mollie-connections/${id}`);
        }

        this.updateProfile = function (organization_id, id, profile_id, data) {
            return ApiRequest.patch(
                `/platform/organizations/${organization_id}/mollie-connections/${id}/profiles/${profile_id}`, data
            );
        }

        this.storeProfile = function (organization_id, id, data) {
            return ApiRequest.post(
                `/platform/organizations/${organization_id}/mollie-connections/${id}/profiles`, data
            );
        }
    });
};

module.exports = [
    'ApiRequest',
    MollieConnectionService
];