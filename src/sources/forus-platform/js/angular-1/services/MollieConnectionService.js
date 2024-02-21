const MollieConnectionService = function(ApiRequest) {
    const prefix = '/platform/organizations';

    return new (function() {
        this.store = function(organization_id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connection`, data);
        };

        this.connect = function(organization_id) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connection/connect`);
        };

        this.getActive = function(organization_id, query = {}) {
            return ApiRequest.get(`${prefix}/${organization_id}/mollie-connection`, query);
        };

        this.fetch = function(organization_id) {
            return ApiRequest.get(`${prefix}/${organization_id}/mollie-connection/fetch`);
        };

        this.update = function (organization_id, data) {
            return ApiRequest.patch(`${prefix}/${organization_id}/mollie-connection`, data);
        }

        this.destroy = function (organization_id) {
            return ApiRequest.delete(`${prefix}/${organization_id}/mollie-connection`);
        }

        this.storeProfile = function (organization_id, data) {
            return ApiRequest.post(`${prefix}/${organization_id}/mollie-connection/profiles`, data);
        }

        this.updateProfile = function (organization_id, id, data) {
            return ApiRequest.patch(`${prefix}/${organization_id}/mollie-connection/profiles/${id}`, data);
        }
    });
};

module.exports = [
    'ApiRequest',
    MollieConnectionService,
];