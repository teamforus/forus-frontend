let ProductsEditComponent = function(
    $state, 
    $stateParams, 
    ProductService, 
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;

    $ctrl.media;

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

        if ($ctrl.product && $ctrl.product.photo) {
            MediaService.read($ctrl.product.photo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }
    };

    $ctrl.selectPhoto = (e) => {
        MediaService.store('product_photo', e.target.files[0]).then(function(res) {
            $ctrl.media = res.data.data;
            $ctrl.form.values.media_uid = $ctrl.media.uid;
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
        'MediaService', 
        ProductsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html'
};