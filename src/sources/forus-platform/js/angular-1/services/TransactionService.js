let TransactionService = function(
    ApiRequest
) {
    return new (function() {
        this.list = function(type, organization_id, query = {}) {
            return ApiRequest.get(
                '/platform/organizations/' + organization_id + '/' + type + '/transactions',
                this.transformFilters(query)
            );
        };

        this.show = function(type, organization_id, address) {
            return ApiRequest.get(
                '/platform/organizations/' + organization_id + '/' +
                type + '/transactions/' + address
            );
        };

        this.transformFilters = function(filters) {
            let values = JSON.parse(JSON.stringify(filters));

            if (values.from) {
                values.from = moment(values.from, 'DD-MM-YYYY').format('YYYY-MM-DD');
            }

            if (values.to) {
                values.to = moment(values.to, 'DD-MM-YYYY').format('YYYY-MM-DD');
            }

            return values;
        };
    });
};

module.exports = [
    'ApiRequest',
    TransactionService
];