const TransactionBulkService = function(ApiRequest) {
    const path = '/platform/organizations';
    
    return new (function() {

        this.list = (organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks`, filters);
        };

        this.show = (organization_id, bulk_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, filters);
        };

        this.bulkNow = (organization_id) => {
            return ApiRequest.post(`${path}/${organization_id}/sponsor/transaction-bulks`);
        };

        // Reset bulk state and resend the payments to BUNQ
        this.reset = (organization_id, bulk_id) => {
            return ApiRequest.patch(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, {
                state: 'pending',
            });
        };

        // Submit the payments to BNG
        this.submit = (organization_id, bulk_id) => {
            return ApiRequest.patch(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, {
                state: 'pending',
            });
        };

        this.export = (type, organization_id, filters = {}) => {
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`${path}/${organization_id}/${type}/transaction-bulks/export`, filters, {}, true, callback);
        };

        this.exportFields = function(type, organization_id) {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transaction-bulks/export-fields`);
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionBulkService
];