const TransactionService = function(ApiRequest) {
    const path = '/platform/organizations';
    
    return new (function() {
        this.list = (type, organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions`, filters);
        };

        this.listBulks = (organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks`, filters);
        };

        this.show = function(type, organization_id, address) {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions/${address}`);
        };

        this.showBulk = (organization_id, bulk_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, filters);
        };

        this.export = (type, organization_id, filters = {}) => {
            const transform = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions/export`, filters, {}, true, transform);
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionService
];