let FundsEditComponent = function(
    $state,
    $scope,
    $timeout,
    $stateParams,
    $rootScope,
    FundService,
    ProductService,
    FormBuilderService,
    MediaService,
) {
    let $ctrl = this;
    let mediaFile = false;

    $ctrl.products = [];

    $ctrl.addProduct = () => {
        $ctrl.form.products.push(null);
        $ctrl.updateProductOptions();
    };

    $ctrl.removeProduct = (product) => {
        let index;

        if ((index = $ctrl.form.products.indexOf(product)) != -1) {
            $ctrl.form.products.splice(index, 1);
        }

        $ctrl.updateProductOptions();
    };

    $scope.$watch('$ctrl.form.products', (products) => {
        if (products && Array.isArray(products)) {
            $ctrl.updateProductOptions();
        }
    }, true);

    $ctrl.updateProductOptions = () => {
        $timeout(() => {
            let productOptions = $ctrl.products.filter(product => {
                return $ctrl.form.products.map(
                    product => product ? product.id : false
                ).filter(id => !!id).indexOf(product.id) == -1;
            });

            $ctrl.productOptions = [];
            $ctrl.form.products.forEach((product, $index) => {
                $ctrl.productOptions[$index] = productOptions.concat(
                    product ? [product] : []
                );
            });
        }, 250);
    };

    $ctrl.getProductOptions = (product) => {
        return ($ctrl.productOptions || []).concat(product);
    };

    $ctrl.$onInit = function() {
        let values = $ctrl.fund ? FundService.apiResourceToForm(
            $ctrl.fund
        ) : {
            default_validator_employee_id: null,
            auto_requests_validation: false,
            formula_products: [],
            criteria: [],
            state: $ctrl.fundStates[0].value
        };

        $ctrl.validators.unshift({
            id: null,
            email: "None"
        });

        if (!$rootScope.appConfigs.features.organizations.funds.criteria) {
            delete values.criteria;
        }

        if (!$rootScope.appConfigs.features.organizations.funds.formula_products) {
            delete values.formula_products;
        }

        $ctrl.form = FormBuilderService.build(values, async (form) => {
            form.lock();

            let promise;

            if (mediaFile) {
                let res = await MediaService.store('fund_logo', mediaFile);

                $ctrl.media = res.data.data;
                $ctrl.form.values.media_uid = $ctrl.media.uid;
            }

            form.values.formula_products = form.products.map(product => product.id);

            if ($ctrl.fund) {
                promise = FundService.update(
                    $stateParams.organization_id,
                    $stateParams.id,
                    form.values
                );
            } else {
                promise = FundService.store(
                    $stateParams.organization_id,
                    form.values
                );
            }

            promise.then((res) => {
                $state.go('organization-funds', {
                    organization_id: $stateParams.organization_id
                });
            }, (res) => {
                $timeout(() => {
                    form.errors = res.data.errors;
                    form.unlock();
                }, 0);
            });
        });

        if ($ctrl.fund && $ctrl.fund.logo) {
            MediaService.read($ctrl.fund.logo.uid).then((res) => {
                $ctrl.media = res.data.data;
            });
        }

        ProductService.listAll({
            per_page: 1000,
            unlimited_stock: 1,
        }).then(res => {
            $ctrl.form.products = $ctrl.products = res.data.data.map(product => ({
                id: product.id,
                price: product.price,
                name: `${product.name} - €${product.price} (${product.organization.name})`,
            }));

            if ($rootScope.appConfigs.features.organizations.funds.formula_products) {
                $ctrl.form.products = $ctrl.form.products.filter(
                    product => $ctrl.form.values.formula_products.indexOf(product.id) != -1
                );
            }

            $ctrl.updateProductOptions();
        }, console.error);
    };

    $ctrl.selectPhoto = (file) => {
        mediaFile = file;
    };

    $ctrl.cancel = function() {
        $state.go('organization-funds', {
            'organization_id': $stateParams.organization_id
        });
    };
};

module.exports = {
    bindings: {
        fund: '<',
        validators: '<',
        recordTypes: '<',
        organization: '<',
        fundStates: '<',
        productCategories: '<',
        validatorOrganizations: '<',
    },
    controller: [
        '$state',
        '$scope',
        '$timeout',
        '$stateParams',
        '$rootScope',
        'FundService',
        'ProductService',
        'FormBuilderService',
        'MediaService',
        FundsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html'
};