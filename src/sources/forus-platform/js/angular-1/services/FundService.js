let FundService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/';

    return new (function() {
        this.list = function(organization_id) {
            if (organization_id) {
                return ApiRequest.get(
                    uriPrefix + organization_id + '/funds'
                );
            }
            return ApiRequest.get('/platform/funds');
        };

        this.store = function(organization_id, values) {
            return ApiRequest.post(
                uriPrefix + organization_id + '/funds',
                this.apiFormToResource(values)
            );
        };

        this.update = function(organization_id, id, values) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/funds/' + id,
                this.apiFormToResource(values)
            );
        };

        this.read = function(organization_id, id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + id
            );
        }

        this.readPublic = function(fund_id) {
            return ApiRequest.get('/platform/funds/' + fund_id);
        };

        this.readFinances = function(organization_id, id, data) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + id + '/finances',
                data || {}
            );
        }

        this.listProviders = function(organization_id, fund_id, state, query) {
            query = query ? query : {};
            query.state = state;

            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers', query
            );
        };

        this.readProvider = function(organization_id, fund_id, provider_id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + provider_id
            );
        };

        this.readProvidersTransactions = function(
            organization_id,
            fund_id,
            provider_id,
            filters = {}
        ) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + 
                '/providers/' + provider_id + '/transactions',
                filters
            );
        };

        this.exportProvidersTransactions = function(
            organization_id,
            fund_id,
            provider_id,
            filters = {}
        ) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + 
                '/providers/' + provider_id + '/transactions/export',
                filters, {}, true, (_cfg) => {
                    _cfg.responseType = 'arraybuffer';
                    _cfg.cache = false;

                    return _cfg;
                }
            );
        };

        this.readProvidersTransaction = function(organization_id, fund_id, provider_id, transaction_id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + provider_id + '/transactions/' + transaction_id
            );
        };

        this.readProvidersFinances = function(organization_id, fund_id, provider_id, data) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + provider_id + '/finances',
                data
            );
        };

        this.dismissProvider = function(organization_id, fund_id, id) {
            return this.updateProvider(organization_id, fund_id, id, {
                dismissed: true
            });
        };

        this.updateProvider = function(organization_id, fund_id, id, data = {}) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/funds/' + fund_id + '/providers/' + id, data);
        };

        this.states = function() {
            return [{
                name: "Waiting",
                value: 'waiting',
            }, {
                name: "Actief",
                value: 'active',
            }, {
                name: "Gepauzeerd",
                value: 'paused',
            }, {
                name: "Gesloten",
                value: 'closed',
            }];
        }

        this.makeTopUp = function(organization_id, fund_id) {
            return ApiRequest.post(
                uriPrefix + organization_id + '/funds/' + fund_id + '/top-up');
        };

        this.apiFormToResource = function(formData) {
            let values = JSON.parse(JSON.stringify(formData));

            values.start_date = moment(values.start_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
            values.end_date = moment(values.end_date, 'DD-MM-YYYY').format('YYYY-MM-DD');

            return values;
        };

        this.apiResourceToForm = function(apiResource) {
            return {
                product_categories: apiResource.product_categories.map(
                    function(product_category) {
                        return product_category.id;
                    }
                ),
                criteria: apiResource.criteria,
                formula_products: apiResource.formula_products || [],
                name: apiResource.name,
                description: apiResource.description,
                state: apiResource.state,
                start_date: moment(apiResource.start_date).format('DD-MM-YYYY'),
                end_date: moment(apiResource.end_date).format('DD-MM-YYYY'),
                notification_amount: apiResource.notification_amount,
                default_validator_employee_id: apiResource.default_validator_employee_id,
                auto_requests_validation: apiResource.auto_requests_validation,
            };
        };

        this.changeState = function(apiResource, state) {
            let formValues = this.apiResourceToForm(apiResource);

            formValues.state = state;

            return this.update(
                apiResource.organization_id,
                apiResource.id,
                formValues
            );
        };

        this.destroy = function(organization_id, fund_id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/funds/' + fund_id
            );
        }

        this.sampleCSV = (fund) => {
            return Papa.unparse([
                fund.csv_required_keys.filter(key => key.indexOf('_eligible') == -1)
            ]);
        };
    });
};

module.exports = [
    'ApiRequest',
    FundService
];