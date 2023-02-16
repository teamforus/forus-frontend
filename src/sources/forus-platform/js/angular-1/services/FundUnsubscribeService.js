const FundUnsubscribeService = function (ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function () {
        this.listProvider = function (organization_id, query = {}) {
            return ApiRequest.get(uriPrefix + `${organization_id}/provider/fund-unsubscribes`, query);
        };

        this.listSponsor = function (organization_id, query = {}) {
            return ApiRequest.get(uriPrefix + `${organization_id}/sponsor/fund-unsubscribes`, query);
        };

        this.store = function (organization_id, data) {
            return ApiRequest.post(`${uriPrefix}${organization_id}/provider/fund-unsubscribes`, data);
        };

        this.update = function (organization_id, id, data) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/provider/fund-unsubscribes/${id}`, data);
        };

        this.updateSponsor = function (organization_id, id, data) {
            return ApiRequest.patch(`${uriPrefix}${organization_id}/sponsor/fund-unsubscribes/${id}`, data);
        };
    });
};

module.exports = [
    'ApiRequest',
    FundUnsubscribeService
];