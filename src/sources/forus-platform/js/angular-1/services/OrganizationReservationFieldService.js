const OrganizationReservationFieldService = function(ApiRequest) {
    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(`/platform/organizations/${organization_id}/reservation-fields`, query);
        };
    });
};

module.exports = [
    'ApiRequest',
    OrganizationReservationFieldService
];