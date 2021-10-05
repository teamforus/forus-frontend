const PhysicalCardsRequestService = function(ApiRequest) {
    const apiPrefix = '/platform/organizations';

    return new (function() {
        this.store = function(organizationId, voucherAddress, data) {
            return ApiRequest.post(`${apiPrefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests`, data);
        };
        
        this.validate = function(organizationId, voucherAddress, data) {
            return ApiRequest.post(`${apiPrefix}/${organizationId}/sponsor/vouchers/${voucherAddress}/physical-card-requests/validate`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardsRequestService
];