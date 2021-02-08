const { isNull } = require("underscore");

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
    $ctrl.nonExpiring = false;

    $ctrl.$onInit = function() {
        let values = $ctrl.product ? ProductService.apiResourceToForm($ctrl.product) : {
            product_category_id: null,
            price_type: 'regular',
        };

        $ctrl.nonExpiring = !values.expire_at;
        $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);

        values.expire_at = $ctrl.nonExpiring ? moment(
            new Date()
        ).add(1, 'day') : moment(values.expire_at, 'YYYY-MM-DD');
        values.expire_at = values.expire_at.format('DD-MM-YYYY');

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

        $ctrl.confirmPriceChange = (confirmCallback) => {
            let priceHasChanged = false;

            if (!$ctrl.product) {
                return confirmCallback();
            }

            if ($ctrl.product.price_type !== $ctrl.form.values.price_type) {
                priceHasChanged = true;
            }

            if ($ctrl.form.values.price_type === 'regular' &&
                parseFloat($ctrl.product.price) !== parseFloat($ctrl.form.values.price)) {
                priceHasChanged = true;
            }

            if (['discount_fixed', 'discount_percentage'].includes($ctrl.form.values.price_type) &&
                parseFloat($ctrl.product.price_discount) !== parseFloat($ctrl.form.values.price_discount)) {
                priceHasChanged = true;
            }

            if (priceHasChanged && $ctrl.product.funds.filter(fund => fund.type == 'subsidies').length > 0) {
                return ModalService.open('modalNotification', {
                    type: 'confirm',
                    title: 'product_edit.confirm_price_change.title',
                    description: 'product_edit.confirm_price_change.description',
                    icon: 'product-create',
                    confirm: () => confirmCallback(),
                });
            }

            return confirmCallback();
        };

        $ctrl.saveProduct = function() {
            $ctrl.confirmPriceChange(() => {
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
            });
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

            let values = {
                ...form.values, ...{
                    expire_at: $ctrl.nonExpiring ? null : moment(
                        form.values.expire_at,
                        'DD-MM-YYYY'
                    ).format('YYYY-MM-DD')
                }
            };;

            if (values.price_type !== 'regular') {
                delete values.price;
            } else if (values.price_type !== 'regular' && values.price_type !== 'free') {
                delete values.price_discount;
            }

            if ($ctrl.product) {
                promise = ProductService.update($ctrl.product.organization_id, $ctrl.product.id, {
                    ...values, ...{
                        total_amount: values.sold_amount + values.stock_amount
                    }
                });
            } else {
                promise = ProductService.store($stateParams.organization_id, values);
            }

            promise.then(() => {
                $state.go('products', { organization_id: $stateParams.organization_id });
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