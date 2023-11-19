const ReservationExtraPaymentService = function (ApiRequest) {
    const uriPrefix = '/platform/organizations';

    return new (function () {
        this.list = function(organization_id, data) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/sponsor/reservation-extra-payments`, data);
        }

        this.read = function(organization_id, id) {
            return ApiRequest.get(`${uriPrefix}/${organization_id}/sponsor/reservation-extra-payments/${id}`);
        }
    });
};

module.exports = [
    'ApiRequest',
    ReservationExtraPaymentService
];