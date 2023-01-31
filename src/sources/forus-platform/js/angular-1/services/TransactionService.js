const TransactionService = function(ApiRequest) {
    const path = '/platform/organizations';

    return new (function() {
        this.list = (type, organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions`, filters);
        };

        this.show = (type, organization_id, address) => {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions/${address}`);
        };

        this.storeBatch = (organization_id, data = {}) => {
            return ApiRequest.post(`${path}/${organization_id}/sponsor/transactions/batch`, { ...data });
        };

        this.storeBatchValidate = (organization_id, data = {}) => {
            return ApiRequest.post(`${path}/${organization_id}/sponsor/transactions/batch/validate`, { ...data });
        };

        this.sampleCsvTransactions = () => {
            const headers = ['voucher_id', 'amount', 'direct_payment_iban', 'direct_payment_name', 'uid', 'note'];
            const values = [1, 10, 'NLXXXXXXXXXXXXXXXX', 'XXXX XXXX', '', ''];

            return Papa.unparse([headers, values]);
        };

        this.export = (type, organization_id, filters = {}) => {
            const callback = (_cfg) => {
                _cfg.responseType = 'arraybuffer';
                _cfg.cache = false;

                return _cfg;
            };

            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions/export`, filters, {}, true, callback);
        };

        this.exportFields = function(type, organization_id) {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transactions/export-fields`);
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionService,
];