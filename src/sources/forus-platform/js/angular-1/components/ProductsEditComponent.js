let ProductsEditComponent = function(
    $state,
    $stateParams,
    $filter,
    appConfigs,
    ProductService,
    FormBuilderService,
    MediaService,
    ModalService
) {
    let $ctrl = this;
    let mediaFile = false;
    let alreadyConfirmed = false;
    let trans = $filter('translate');

    $ctrl.media;
    $ctrl.mediaErrors = [];

    $ctrl.$onInit = function() {
        let values = {
            product_category_id: null
        };

        $ctrl.maxProductCount = appConfigs.flags.maxProductCount ? appConfigs.flags.maxProductCount : null;

        if ($ctrl.maxProductCount && !$ctrl.product && $ctrl.products.length >= $ctrl.maxProductCount) {
            ModalService.open('modalNotification', {
                type: 'danger',
                title: trans('product_edit.errors.already_added'),
                icon: 'product-error',
                cancel: () => {
                    return $state.go('products', {
                        organization_id: $stateParams.organization_id
                    });
                }
            });
        }

        if ($ctrl.product) {
            values = ProductService.apiResourceToForm($ctrl.product);
        }

        $ctrl.productCategories.unshift({
            id: null,
            name: 'Selecteer categorie'
        });

        $ctrl.saveProduct = function() {
            if (!$ctrl.product && !alreadyConfirmed) {
                ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: trans('product_edit.confirm_create.title'),
                    description: trans('product_edit.confirm_create.description'),
                    icon: 'product-create',
                    confirm: () => {
                        alreadyConfirmed = true;
                        $ctrl.form.submit();
                    }
                });
            } else {
                $ctrl.form.submit();
            }
        };

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            if ($ctrl.product && form.values.stock_amount < 0) {
                return $ctrl.form.errors.stock_amount = [
                    'Nog te koop moet minimaal 0 zijn.'
                ];
            }

            form.lock();

            let promise;

            if (mediaFile && $ctrl.mediaErrors.length == 0) {
                try {
                    let res = await MediaService.store('product_photo', mediaFile);

                    $ctrl.media = res.data.data;
                    $ctrl.form.values.media_uid = $ctrl.media.uid;

                    mediaFile = false;
                } catch (err) {
                    $ctrl.mediaErrors = err.data.errors.file;
                }
            }

            if ($ctrl.product) {
                let values = JSON.parse(JSON.stringify(form.values));

                values.total_amount = values.sold_amount + values.stock_amount;

                promise = ProductService.update(
                    $ctrl.product.organization_id,
                    $ctrl.product.id,
                    values
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

        if (mediaFile.size > (1024 * 1024 * 2)) {
            $ctrl.mediaErrors = [trans('product_edit.media_file_to_big')];
        } else {
            $ctrl.mediaErrors = [];
        }
    };

    $ctrl.cancel = function() {
        $state.go('products', { 'organization_id': $stateParams.organization_id });
    };
};

module.exports = {
    bindings: {
        product: '<',
        productCategories: '<',
        products: '<'
    },
    controller: [
        '$state',
        '$stateParams',
        '$filter',
        'appConfigs',
        'ProductService',
        'FormBuilderService',
        'MediaService',
        'ModalService',
        ProductsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html'
};
