const TransactionBulkService = function (ApiRequest) {
    const path = '/platform/organizations';

    return new (function () {
        this.list = (organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks`, filters);
        };

        this.show = (organization_id, bulk_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}`, filters);
        };

        this.bulkNow = (organization_id, filters = {}) => {
            return ApiRequest.post(`${path}/${organization_id}/sponsor/transaction-bulks`, filters);
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

        // set the bulk as paid
        this.acceptManually = (organization_id, bulk_id) => {
            return ApiRequest.patch(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}/set-accepted`);
        };

        // export bulk details
        this.export = (type, organization_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transaction-bulks/export`, filters, {}, true, {
                responseType: 'arraybuffer',
                cache: false,
            });
        };

        // get export fields
        this.exportFields = function (type, organization_id) {
            return ApiRequest.get(`${path}/${organization_id}/${type}/transaction-bulks/export-fields`);
        };

        // export SEPA file
        this.exportSepa = (organization_id, bulk_id, filters = {}) => {
            return ApiRequest.get(`${path}/${organization_id}/sponsor/transaction-bulks/${bulk_id}/export-sepa`, filters, {}, true, {
                responseType: 'arraybuffer',
                cache: false,
            });
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionBulkService,
];