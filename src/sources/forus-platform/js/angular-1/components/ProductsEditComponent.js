const ProductsEditComponent = function (
    $q,
    $state,
    $stateParams,
    appConfigs,
    ProductService,
    OrganizationService,
    FormBuilderService,
    MediaService,
    ModalService
) {
    const $ctrl = this;

    let mediaFile = false;
    let alreadyConfirmed = false;

    $ctrl.media = null;
    $ctrl.mediaErrors = [];
    $ctrl.nonExpiring = false;

    $ctrl.reservationPolicies = [{
        value: 'global',
        // Use global settings
        label: 'Gebruik standaard instelling',
    }, {
        // Auto accept
        value: 'accept',
        label: 'Automatisch accepteren'
    }, {
        value: 'review',
        // Review all reservations
        label: 'Handmatig controleren',
    }];

    $ctrl.reservationFieldOptions = [{
        value: 'global',
        label: 'Gebruik standaard instelling',
    }, {
        value: "no",
        label: "Nee"
    }, {
        value: "optional",
        label: "Optioneel"
    }, {
        value: "required",
        label: "Verplicht"
    }];

    $ctrl.goToFundProvider = (provider) => {
        $state.go('fund-provider', {
            organization_id: provider.fund.organization_id,
            fund_id: provider.fund_id,
            fund_provider_id: provider.id,
        });
    };

    $ctrl.uploadMediaFile = () => {
        const syncPresets = ['thumbnail', 'small'];

        return $q((resolve, reject) => {
            if (mediaFile) {
                return MediaService.store('product_photo', mediaFile, syncPresets).then(
                    (res) => resolve($ctrl.media = res.data.data),
                    (err) => reject(err.data.errors.file),
                );
            }

            if (!$ctrl.product && $ctrl.sourceProduct?.photo?.uid) {
                return MediaService.clone($ctrl.sourceProduct.photo?.uid, syncPresets).then(
                    (res) => resolve($ctrl.media = res.data.data),
                    (err) => reject(err.data.errors.file),
                );
            }

            return resolve(null);
        });
    }

    $ctrl.buildForm = () => {
        const values = $ctrl.product || $ctrl.sourceProduct ? ProductService.apiResourceToForm(
            $ctrl.product ? $ctrl.product : $ctrl.sourceProduct
        ) : {
            reservation_enabled: true,
            reservation_policy: 'global',
            reservation_phone: 'global',
            reservation_address: 'global',
            reservation_birth_date: 'global',
            product_category_id: null,
            price_type: 'regular',
        };

        values.expire_at = $ctrl.nonExpiring ? moment().add(1, 'day') : moment(values.expire_at, 'YYYY-MM-DD');
        values.expire_at = values.expire_at.format('DD-MM-YYYY');

        $ctrl.form = FormBuilderService.build(values, (form) => {
            if ($ctrl.product && !$ctrl.product.unlimited_stock && form.values.stock_amount < 0) {
                form.unlock();

                return $ctrl.form.errors.stock_amount = [
                    'Nog te koop moet minimaal 0 zijn.'
                ];
            }

            const onMediaPrepared = (media_uid) => {
                let promise;
                const expire_at = $ctrl.nonExpiring ? null : moment(form.values.expire_at, 'DD-MM-YYYY').format('YYYY-MM-DD');
                const values = { ...form.values, expire_at, media_uid };

                if (values.price_type !== 'regular') {
                    delete values.price;
                } else if (values.price_type !== 'regular' && values.price_type !== 'free') {
                    delete values.price_discount;
                }

                if (values.unlimited_stock) {
                    delete values.total_amount;
                }

                if ($ctrl.product) {
                    const updateValues = {
                        ...values,
                        ...{ total_amount: values.sold_amount + values.stock_amount }
                    };

                    if (!$ctrl.fundProvider) {
                        promise = ProductService.update(
                            $ctrl.organization.id,
                            $ctrl.product.id,
                            updateValues
                        );
                    } else {
                        promise = OrganizationService.sponsorProductUpdate(
                            $ctrl.organization.id,
                            $ctrl.fundProvider.organization_id,
                            $ctrl.product.id,
                            updateValues
                        );
                    }
                } else {
                    if (!$ctrl.fundProvider) {
                        promise = ProductService.store($ctrl.organization.id, values);
                    } else {
                        promise = OrganizationService.sponsorStoreProduct(
                            $ctrl.organization.id,
                            $ctrl.providerOrganization.id,
                            values
                        );
                    }
                }

                promise.then((res) => {
                    if (!$ctrl.fundProvider) {
                        $state.go('products', { organization_id: $ctrl.organization.id });
                    } else {
                        if ($ctrl.fundProvider.fund.type === 'subsidies') {
                            $state.go($ctrl.product ? 'fund-provider-product' : 'fund-provider-product-subsidy-edit', {
                                organization_id: $ctrl.fundProvider.fund.organization_id,
                                fund_id: $ctrl.fundProvider.fund_id,
                                fund_provider_id: $ctrl.fundProvider.id,
                                product_id: res.data.data.id
                            });
                        } else {
                            $ctrl.goToFundProvider($ctrl.fundProvider);
                        }
                    }
                }, (res) => {
                    form.errors = res.data.errors;
                    form.unlock();
                });
            };

            return $ctrl.uploadMediaFile().then((media) => {
                onMediaPrepared(media ? media.uid : $ctrl.form.values.media_uid);
            }, (errors) => {
                $ctrl.mediaErrors = errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.priceWillChange = (product) => {
        if (!product) {
            return false;
        }

        if (product.price_type !== $ctrl.form.values.price_type) {
            return true;
        }

        if ($ctrl.form.values.price_type === 'regular' &&
            parseFloat(product.price) !== parseFloat($ctrl.form.values.price)) {
            return true;
        }

        if (['discount_fixed', 'discount_percentage'].includes($ctrl.form.values.price_type) &&
            parseFloat(product.price_discount) !== parseFloat($ctrl.form.values.price_discount)) {
            return true;
        }

        return true;
    };

    $ctrl.hasSubsidyFunds = (product) => {
        return product && (product.sponsor_organization_id || product.funds.filter(fund => {
            return fund.type == 'subsidies';
        }).length > 0);
    };

    $ctrl.confirmPriceChange = () => {
        return $q((resolve) => {
            if (alreadyConfirmed) {
                return resolve(true);
            }

            ModalService.open('modalNotification', {
                type: 'confirm',
                title: 'product_edit.confirm_price_change.title',
                description: 'product_edit.confirm_price_change.description',
                icon: 'product-create',
                confirm: () => {
                    alreadyConfirmed = true;
                    resolve(true);
                },
                cancel: () => resolve(false),
            });
        });
    };

    $ctrl.saveProduct = () => {
        const product = $ctrl.product;

        if ($ctrl.priceWillChange(product) && $ctrl.hasSubsidyFunds(product)) {
            return $ctrl.confirmPriceChange().then((confirmed) => {
                if (confirmed) {
                    $ctrl.form.submit();
                }
            });
        }

        $ctrl.form.submit();
    };

    $ctrl.selectPhoto = (file) => {
        mediaFile = file;
    };

    $ctrl.cancel = () => {
        if ($ctrl.fundProvider) {
            $ctrl.goToFundProvider($ctrl.fundProvider);
        } else {
            $state.go('products', { 'organization_id': $stateParams.organization_id });
        }
    };

    $ctrl.$onInit = function () {
        const { reservations_budget_enabled, reservations_subsidy_enabled } = $ctrl.organization;

        $ctrl.nonExpiring = !$ctrl.product || ($ctrl.product && !$ctrl.product.expire_at);
        $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);
        $ctrl.allowsReservations = reservations_budget_enabled || reservations_subsidy_enabled;

        $ctrl.buildForm();
        $ctrl.isEditable = !$ctrl.product || !$ctrl.product.sponsor_organization_id || (
            $ctrl.product.sponsor_organization_id === $ctrl.organization.id
        );

        if ($ctrl.maxProductCount && !$ctrl.product && $ctrl.products && $ctrl.products.length >= $ctrl.maxProductCount) {
            ModalService.open('modalNotification', {
                type: 'danger',
                title: 'product_edit.errors.already_added',
                icon: 'product-error',
                cancel: () => $state.go('products', { organization_id: $stateParams.organization_id }),
            });
        }

        $ctrl.media = ($ctrl.sourceProduct || $ctrl.product)?.photo || null;
    };
};

module.exports = {
    bindings: {
        product: '<',
        products: '<',
        fundProvider: '<',
        organization: '<',
        sourceProduct: '<',
        providerOrganization: '<',
    },
    controller: [
        '$q',
        '$state',
        '$stateParams',
        'appConfigs',
        'ProductService',
        'OrganizationService',
        'FormBuilderService',
        'MediaService',
        'ModalService',
        ProductsEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html',
};