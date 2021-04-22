let sprintf = require('sprintf-js').sprintf;

let PhysicalCardsService = function(
    ApiRequest
) {
    let apiPrefix = '/platform/sponsor';

    return new(function() {

        this.show = function(organizationId, voucherId, data) {
            return ApiRequest.get(sprintf(
                '%s/%s/vouchers/%s/physical-cards',
                apiPrefix,
                organizationId,
                voucherId
            ), data);
        };

        this.store = function(organizationId, voucherId, data) {
            return ApiRequest.post(sprintf(
                '%s/%s/vouchers/%s/physical-cards',
                apiPrefix,
                organizationId,
                voucherId
            ), data);
        };

        this.destroy = function(organizationId, voucherId, physicalCardId) {
            return ApiRequest.delete(sprintf(
                '%s/%s/vouchers/%s/physical-cards/%s',
                apiPrefix,
                organizationId,
                voucherId,
                physicalCardId
            ));
        };
    });
};

module.exports = [
    'ApiRequest',
    PhysicalCardsService
];