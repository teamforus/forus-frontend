let PhysicalCardService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/vouchers';

    return new(function() {
        this.storePhysicalCard = function(address, values) {
            return ApiRequest.post(apiPrefix + '/' + address + '/physical-cards', values);
        };

        this.requestPhysicalCard = function(address, values) {
            return ApiRequest.post(apiPrefix + '/' + address + '/physical-card-requests', values);
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardService
];