let ProductService = function(ApiRequest) {
    let uriPrefix = '/platform/organizations/';

    return new(function() {
        this.list = function(organization_id, query) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/products', query
            );
        };

        this.listAll = function(query) {
            return ApiRequest.get('/platform/products', query);
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
                this.apiFormToResource(values)
            );
        };

        this.read = function(organization_id, id) {
            return ApiRequest.get(
                uriPrefix + organization_id + '/products/' + id
            );
        }

        this.destroy = function(organization_id, id) {
            return ApiRequest.delete(
                uriPrefix + organization_id + '/products/' + id
            );
        };

        this.apiFormToResource = function(formData) {
            let values = JSON.parse(JSON.stringify(formData));

            values.expire_at = moment(values.expire_at, 'DD-MM-YYYY').format('YYYY-MM-DD');

            return values;
        };

        this.apiResourceToForm = function(apiResource) {
            return {
                'name': apiResource.name,
                'description': apiResource.description,
                'price': parseFloat(apiResource.price),
                'old_price': parseFloat(apiResource.old_price),
                'total_amount': apiResource.total_amount,
                'stock_amount': apiResource.stock_amount,
                'sold_amount': apiResource.total_amount - apiResource.stock_amount,
                'expire_at': moment(apiResource.expire_at).format('DD-MM-YYYY'),
                'product_category_id': apiResource.product_category_id,
            };
        };
    });
};

module.exports = [
    'ApiRequest',
    ProductService
];