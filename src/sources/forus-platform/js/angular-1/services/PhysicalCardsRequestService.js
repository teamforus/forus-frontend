const sprintf = require('sprintf-js').sprintf;

const PhysicalCardsRequestService = function(ApiRequest) {
    const apiPrefix = '/platform/vouchers';

    return new (function() {
        this.store = function(voucherAddress, data) {
            return ApiRequest.post(sprintf(
                '%s/%s/physical-card-requests',
                apiPrefix,
                voucherAddress
            ), data);
        };
        
        this.validate = function(voucherAddress, data) {
            return ApiRequest.post(sprintf(
                '%s/%s/physical-card-requests/validate',
                apiPrefix,
                voucherAddress
            ), data);
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardsRequestService
];