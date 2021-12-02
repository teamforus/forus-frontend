const BankConnectionService = function(ApiRequest) {
    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/bank-connections`, query);
        };

        this.store = function(organization_id, data) {
            return ApiRequest.post(`/platform/organizations/${organization_id}/bank-connections`, data);
        };

        this.show = function(organization_id, connection_id) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/bank-connections/${connection_id}`);
        };

        this.update = function(organization_id, connection_id, data) {
            return ApiRequest.patch(`/platform/organizations/${organization_id}/bank-connections/${connection_id}`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    BankConnectionService
];