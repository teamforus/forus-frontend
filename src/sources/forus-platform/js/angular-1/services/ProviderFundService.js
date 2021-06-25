const ProviderFundService = function(ApiRequest) {
    const uriPrefix = '/platform/organizations/';

    return new (function() {
        this.listAvailableFunds = function(organization_id, data) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/provider/funds-available', data
            );
        };

        this.listFunds = function(organization_id, state) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/provider/funds',
                state ? { state: state } : {}
            );
        };

        this.readFundProvider = function(organization_id, fund_provider_id, query = {}) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/provider/funds/' + fund_provider_id, query
            );
        };

        this.applyForFund = function(organization_id, fund_id) {
            return ApiRequest.post(uriPrefix + organization_id + '/provider/funds', { fund_id });
        };

        this.cancelApplicationRequest = function(organization_id, fund_provider_id) {
            return ApiRequest.delete(uriPrefix + organization_id + '/provider/funds/' + fund_provider_id);
        };
    });
};

module.exports = [
    'ApiRequest',
    ProviderFundService
];