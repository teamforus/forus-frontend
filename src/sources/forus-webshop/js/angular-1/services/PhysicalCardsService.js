const PhysicalCardService = function(ApiRequest) {
    const apiPrefix = '/platform/vouchers';

    return new(function() {
        this.store = function(voucherAddress, data) {
            return ApiRequest.post(`${apiPrefix}/${voucherAddress}/physical-cards`, data);
        };

        this.destroy = function(voucherAddress, physical_card) {
            return ApiRequest.delete(`${apiPrefix}/${voucherAddress}/physical-cards/${physical_card}`);
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardService
];