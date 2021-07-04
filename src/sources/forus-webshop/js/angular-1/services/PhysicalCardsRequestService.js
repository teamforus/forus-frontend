let sprintf = require('sprintf-js').sprintf;

let PhysicalCardsRequestService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/vouchers';

    return new (function() {
        this.index = function(voucherAddress, data) {
            return ApiRequest.get(sprintf(
                '%s/%s/physical-card-requests',
                apiPrefix,
                voucherAddress
            ), data);
        };
        
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

        this.show = function(address, request_id) {
            return ApiRequest.get(sprintf(
                '%s/%s/physical-card-requests/%s',
                apiPrefix,
                address,
                request_id
            ), data);
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardsRequestService
];