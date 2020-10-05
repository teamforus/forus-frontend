let sprintf = require('sprintf-js').sprintf;

let PhysicalCardService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/vouchers';

    return new(function() {
        this.store = function(voucherAddress, data) {
            return ApiRequest.post(sprintf(
                '%s/%s/physical-cards',
                apiPrefix,
                voucherAddress
            ), data);
        };

        this.destroy = function(voucherAddress, physical_card) {
            return ApiRequest.delete(sprintf(
                '%s/%s/physical-cards/%s',
                apiPrefix,
                voucherAddress,
                physical_card
            ));
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardService
];