const ProductsEditComponent = function(
    $state,
    $stateParams,
    appConfigs,
    FundService,
    ProductService,
    OrganizationService,
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
    $ctrl.sponsorProduct = false;

    $ctrl.goToFundProvider = (provider) => {
        $state.go('fund-provider', {
            organization_id: provider.fund.organization_id,
            fund_id: provider.fund_id,
            fund_provider_id: provider.id,
        });
    };

    $ctrl.uploadMediaFile = async () => {
        try {
            $ctrl.media = (await MediaService.store('product_photo', mediaFile)).data.data;
            mediaFile = false;

            return $ctrl.media.uid;
        } catch (err) {
            $ctrl.mediaErrors = err.data.errors.file;
        }

        return null;
    }

    $ctrl.buildSubsidyForm = () => {
        const provider = $ctrl.fundProvider;
        const fromProduct = ($ctrl.product || $ctrl.sourceProduct);
        const dealsHistory = (fromProduct && fromProduct.deals_history) ? fromProduct.deals_history : [];
        const deal = dealsHistory.filter((deal) => deal.active)[0] || false;

        const values = deal ? {
            expire_at: deal.expire_at ? deal.expire_at : $ctrl.fundProvider.fund.end_date,
            expires_with_fund: deal.expire_at ? false : true,
            limit_total: parseFloat(deal.limit_total),
            unlimited_stock: deal.limit_total_unlimited,
            limit_per_identity: parseInt(deal.limit_per_identity),
            amount: parseFloat(deal.amount),
            gratis: parseFloat(deal.amount) === parseFloat(fromProduct.amount),
        } : {
            expire_at: $ctrl.fundProvider.fund.end_date,
            expires_with_fund: true,
            limit_total: 1,
            unlimited_stock: false,
            limit_per_identity: 1,
            amount: 0,
            gratis: false,
        };

        $ctrl.subsidyForm = FormBuilderService.build(values, (form) => {
            FundService.updateProvider(provider.fund.organization_id, provider.fund.id, provider.id, {
                enable_products: [{
                    id: $ctrl.sponsorProduct.id,
                    amount: form.values.gratis ? $ctrl.sponsorProduct.price : form.values.amount,
                    limit_total: form.values.limit_total,
                    limit_total_unlimited: form.values.unlimited_stock ? 1 : 0,
                    limit_per_identity: form.values.limit_per_identity,
                    expire_at: form.values.expires_with_fund ? null : form.values.expire_at,
                }],
            }).then(() => {
                $ctrl.goToFundProvider(provider);
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.buildForm = () => {
        const values = $ctrl.product || $ctrl.sourceProduct ? ProductService.apiResourceToForm(
            $ctrl.product ? $ctrl.product : $ctrl.sourceProduct
        ) : {
                product_category_id: null,
                price_type: 'regular',
            };

        values.expire_at = $ctrl.nonExpiring ? moment().add(1, 'day') : moment(values.expire_at, 'YYYY-MM-DD');
        values.expire_at = values.expire_at.format('DD-MM-YYYY');

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            if ($ctrl.product && !$ctrl.product.unlimited_stock && form.values.stock_amount < 0) {
                form.unlock();

                return $ctrl.form.errors.stock_amount = [
                    'Nog te koop moet minimaal 0 zijn.'
                ];
            }

            let promise;

            if (mediaFile && !($ctrl.form.values.media_uid = await $ctrl.uploadMediaFile())) {
                return form.unlock();
            }

            const values = {
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
                        form.unlock();
                        $ctrl.sponsorProduct = res.data.data;
                        $ctrl.subsidyForm.submit();
                    } else {
                        $ctrl.goToFundProvider($ctrl.fundProvider);
                    }
                }
            }, (res) => {
                form.errors = res.data.errors;
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
        return product && product.funds.filter(fund => fund.type == 'subsidies').length > 0;
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
                confirm: () => () => {
                    alreadyConfirmed = true;
                    resolve(true);
                },
                cancel: () => resolve(false),
            });
        });
    };

    $ctrl.saveProduct = (product) => {
        if ($ctrl.sponsorProduct) {
            return $ctrl.subsidyForm.submit();
        }

        if ($ctrl.priceWillChange(product) && $ctrl.hasSubsidyFunds(product)) {
            return $ctrl.confirmPriceChange().then((confirmed) => {
                if (confirmed) {
                    $ctrl.form.submit();
                }
            });
        }

        $ctrl.form.submit();
    };

    $ctrl.selectPhoto = (file) => mediaFile = file;

    $ctrl.cancel = () => {
        if ($ctrl.fundProvider) {
            $ctrl.goToFundProvider($ctrl.fundProvider);
        } else {
            $state.go('products', { 'organization_id': $stateParams.organization_id });
        }
    };

    $ctrl.$onInit = function() {
        console.log($ctrl);
        $ctrl.nonExpiring = !$ctrl.product || ($ctrl.product && !$ctrl.product.expire_at);
        $ctrl.maxProductCount = parseInt(appConfigs.features.products_hard_limit);
        $ctrl.buildForm();
        $ctrl.isEditable = !$ctrl.product || !$ctrl.product.sponsor_organization_id || (
            $ctrl.product.sponsor_organization_id === $ctrl.organization.id
        );

        if ($ctrl.fundProvider) {
            $ctrl.buildSubsidyForm();
        }

        if ($ctrl.maxProductCount && !$ctrl.product && $ctrl.products && $ctrl.products.length >= $ctrl.maxProductCount) {
            ModalService.open('modalNotification', {
                type: 'danger',
                title: 'product_edit.errors.already_added',
                icon: 'product-error',
                cancel: () => $state.go('products', { organization_id: $stateParams.organization_id }),
            });
        }

        if ($ctrl.product && $ctrl.product.photo) {
            MediaService.read($ctrl.product.photo.uid).then((res) => $ctrl.media = res.data.data);
        }
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
        '$state',
        '$stateParams',
        'appConfigs',
        'FundService',
        'ProductService',
        'OrganizationService',
        'FormBuilderService',
        'MediaService',
        'ModalService',
        ProductsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/products-edit.html'
};