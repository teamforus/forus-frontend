let ProductsEditComponent = function(
    $timeout,
    $state,
    $stateParams,
    appConfigs,
    ProductService,
    FormBuilderService,
    MediaService,
    ModalService
) {
    let $ctrl = this;
    let mediaFile = false;
    let alreadyConfirmed = false;

    $ctrl.media;
    $ctrl.mediaErrors = [];

    $ctrl.clearPrices = (no_price) => {
        if (no_price) {
            delete $ctrl.form.values.price;
            delete $ctrl.form.values.old_price;
        }
    };

    $ctrl.$onInit = function() {
        let values = $ctrl.product ? ProductService.apiResourceToForm(
            $ctrl.product
        ) : {
            product_category_id: null
        };

        $ctrl.maxProductCount = appConfigs.flags.maxProductCount ? appConfigs.flags.maxProductCount : null;

        if ($ctrl.maxProductCount && !$ctrl.product && $ctrl.products.length >= $ctrl.maxProductCount) {
            ModalService.open('modalNotification', {
                type: 'danger',
                title: 'product_edit.errors.already_added',
                icon: 'product-error',
                cancel: () => {
                    return $state.go('products', {
                        organization_id: $stateParams.organization_id
                    });
                }
            });
        }

        $ctrl.saveProduct = function() {
            if (!$ctrl.product && !alreadyConfirmed) {
                ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: 'product_edit.confirm_create.title',
                    description: 'product_edit.confirm_create.description',
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
            if ($ctrl.product && !$ctrl.product.unlimited_stock && form.values.stock_amount < 0) {
                return $ctrl.form.errors.stock_amount = [
                    'Nog te koop moet minimaal 0 zijn.'
                ];
            }

            form.lock();

            let promise;

            if (mediaFile) {
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
                $timeout(() => {
                    form.errors = res.data.errors;
                    form.unlock();
                }, 100);
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

    $ctrl.cancel = function() {
        $state.go('products', {
            'organization_id': $stateParams.organization_id
        });
    };
};

module.exports = {
    bindings: {
        product: '<',
        // productCategories: '<',
        products: '<'
    },
    controller: [
        '$timeout',
        '$state',
        '$stateParams',
        'appConfigs',
        'ProductService',
        'FormBuilderService',
        'MediaService',
        'ModalService',
        ProductsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html'
};