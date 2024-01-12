const MollieConnectionService = function(ApiRequest) {
    const prefix = '/platform/organizations';

    return new (function() {
        this.store = function(organization_id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connections`, data);
        };

        this.connect = function(organization_id) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connections/connect`);
        };

        this.getActive = function(organization_id, query = {}) {
            return ApiRequest.get(`${prefix}/${organization_id}/mollie-connections/active`, query);
        };

        this.fetch = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/mollie-connections/fetch`);
        };

        this.destroy = function (organization_id, id) {
            return ApiRequest.delete(`${prefix}/${organization_id}/mollie-connections/${id}`);
        }

        this.storeProfile = function (organization_id, id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connections/${id}/profiles`, data);
        }

        this.updateProfile = function (organization_id, connection_id, id, data) {
            return ApiRequest.patch(`${prefix}/${organization_id}/mollie-connections/${connection_id}/profiles/${id}`, data);
        }

        this.setCurrentProfile = function (organization_id, connection_id, id) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connections/${connection_id}/profiles/${id}/current`);
        }
    });
};

module.exports = [
    'ApiRequest',
    MollieConnectionService,
];