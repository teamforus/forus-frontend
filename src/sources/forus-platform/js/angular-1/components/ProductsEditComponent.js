let ProductsEditComponent = function(
    $state, 
    $stateParams, 
    ProductService, 
    FormBuilderService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let values = $ctrl.product ? ProductService.apiResourceToForm(
            $ctrl.product
        ) : {
            "product_category_id": null,
            "sold_amount": 0
        };

        $ctrl.productCategories.unshift({
            id: null,
            name: 'Select category'
        });

        $ctrl.form = FormBuilderService.build(values, (form) => {
            let promise;

            form.lock();

            if ($ctrl.product) {
                promise = ProductService.update(
                    $ctrl.product.organization_id,
                    $ctrl.product.id,
                    form.values
                )
            } else {
                promise = ProductService.store(
                    $stateParams.organization_id,
                    form.values
                )
            }

            promise.then((res) => {
                $state.go('products', {
                    organization_id: $stateParams.organization_id
                });
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        });
    };
};

module.exports = {
    bindings: {
        product: '<',
        productCategories: '<',
    },
    controller: [
        '$state', 
        '$stateParams', 
        'ProductService', 
        'FormBuilderService', 
        ProductsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html'
};