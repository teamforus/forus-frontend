let sprintf = require('sprintf-js').sprintf;

let ProductService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/';
    let uriPublicPrefix = '/platform/products/';

    return new (function() {
        this.list = function(organization_id, query = {}) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/products', query
            );
        };

        this.listAll = function(query = {}) {
            return ApiRequest.get('/platform/products', query);
        };

        this.listProductFunds = function(organization_id, fund_id, query = {}) {
            return ApiRequest.get(
                sprintf('%s%s/products/%s/funds', uriPrefix, organization_id, fund_id),
                query
            );
        };

        this.store = function(organization_id, values) {
            return ApiRequest.post(
                uriPrefix + organization_id + '/products',
                this.apiFormToResource(values)
            );
        };

        this.update = function(organization_id, id, values) {
            return ApiRequest.patch(
                uriPrefix + organization_id + '/products/' + id,
                this.apiFormToResource(values));
        };

        this.updateExclusions = function(organization_id, product_id, values) {
            return ApiRequest.patch(
                sprintf('%s%s/products/%s/exclusions', uriPrefix, organization_id, product_id),
                values
            );
        };

        this.read = function(organization_id, id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/products/' + id
            );
        };

        this.readPublic = function(id, query = {}) {
            return ApiRequest.get(sprintf(
                sprintf('%s%s', uriPublicPrefix, id),
                query
            ));
        };

        this.destroy = function(organization_id, id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/products/' + id
            );
        };

        this.apiFormToResource = function(formData) {
            return {...formData};
        };

        this.apiResourceToForm = function(apiResource) {
            return {
                name: apiResource.name,
                description: apiResource.description,
                description_html: apiResource.description_html,

                price: parseFloat(apiResource.price),
                price_type: apiResource.price_type,
                price_discount: apiResource.price_discount !== null ? parseFloat(
                    apiResource.price_discount
                ) : null,

                expire_at: apiResource.expire_at,
                total_amount: apiResource.total_amount,
                stock_amount: apiResource.stock_amount,
                unlimited_stock: apiResource.unlimited_stock,
                sold_amount: apiResource.total_amount - apiResource.stock_amount,
                product_category_id: apiResource.product_category_id,

                reservation_enabled: apiResource.reservation_enabled,
                reservation_policy: apiResource.reservation_policy,

                reservation_phone: apiResource.reservation_phone,
                reservation_address: apiResource.reservation_address,
                reservation_requester_birth_date: apiResource.reservation_requester_birth_date,
            };
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductService
];