let ProductsEditComponent = function(
    $state, 
    $stateParams, 
    ProductService, 
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;
    let mediaFile = false;

    $ctrl.media;

    $ctrl.$onInit = function() {
        let values = $ctrl.product ? ProductService.apiResourceToForm(
            $ctrl.product
        ) : {
            "product_category_id": null,
        };

        $ctrl.productCategories.unshift({
            id: null,
            name: 'Selecteer categorie'
        });

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            form.lock();

            let promise;

            if (mediaFile) {
                let res = await MediaService.store('product_photo', mediaFile);

                $ctrl.media = res.data.data;
                $ctrl.form.values.media_uid = $ctrl.media.uid;

                mediaFile = false;
            }

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

    $ctrl.selectPhoto = (file) => {
        mediaFile = file;
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