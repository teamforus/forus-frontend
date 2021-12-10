const FundsEditComponent = function(
    $state,
    $scope,
    $timeout,
    $stateParams,
    $rootScope,
    FundService,
    ProductService,
    FormBuilderService,
    PushNotificationsService,
    MediaService,
) {
    const $ctrl = this;
    let mediaFile = false;

    $ctrl.products = [];
    $ctrl.criteriaEditor = null;
    $ctrl.faqEditor = null

    $ctrl.applicationMethods = [{
        key: 'application_form',
        name: 'Aanvraagformulier',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 1,
            allow_prevalidations: 1,
        },
    }, {
        key: 'activation_codes',
        name: 'Activatiecodes',
        default_button_text: "Activeren",
        configs: {
            allow_fund_requests: 1,
            allow_prevalidations: 0,
        },
    }, {
        key: 'application_form_and_activation_codes',
        name: 'Aanvraagformulier en activatiecodes',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 0,
            allow_prevalidations: 1,
        },
    }, {
        key: 'external',
        name: 'Geen aanvraagformulier en activatiecodes (extern)',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 0,
            allow_prevalidations: 0,
        },
    }];

    $ctrl.findMethod = (key) => {
        return $ctrl.applicationMethods.filter((method) => method.key == key)[0] || {};
    };

    $ctrl.onMethodChange = (value, prevValue) => {
        const method = $ctrl.findMethod(value);
        const preMethod = $ctrl.findMethod(prevValue);

        if (preMethod.default_button_text == $ctrl.form.values.request_btn_text) {
            $ctrl.form.values.request_btn_text = method.default_button_text;
        }
    };

    $ctrl.fundTypes = [{
        key: 'budget',
        name: 'Waardebon'
    }, {
        key: 'subsidies',
        name: 'Kortingspas'
    }, {
        key: 'external',
        name: 'Geen (extern)'
    }];

    $ctrl.getProductOptions = (product) => ($ctrl.productOptions || []).concat(product);

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

    $ctrl.selectPhoto = (file) => {
        mediaFile = file;
    };

    $ctrl.cancel = function() {
        $state.go('organization-funds', {
            'organization_id': $stateParams.organization_id
        });
    };

    $ctrl.registerCriteriaEditor = function(childRef) {
        $ctrl.criteriaEditor = childRef;
    }

    $ctrl.registerFaqEditor = function(childRef) {
        $ctrl.faqEditor = childRef;
    }

    $ctrl.appendMedia = (media_uid, formValue) => {
        if (!Array.isArray(formValue.description_media_uid)) {
            formValue.description_media_uid = [];
        }

        formValue.description_media_uid.push(media_uid);
    };

    $ctrl.$onInit = function() {
        let values = $ctrl.fund ? FundService.apiResourceToForm($ctrl.fund) : {
            default_validator_employee_id: null,
            auto_requests_validation: false,
            formula_products: [],
            criteria: [],
            faq: [],
            state: $ctrl.fundStates[0].value,
            type: 'budget',
            application_method: 'application_form',
            request_btn_text: $ctrl.findMethod('application_form').default_button_text,
            allow_direct_requests: true,
            start_date: moment().add(6, 'days').format('DD-MM-YYYY'),
            end_date: moment().add(1, 'years').format('DD-MM-YYYY'),
        };

        $ctrl.validators.unshift({
            id: null,
            email: "Geen"
        });

        if (!$rootScope.appConfigs.features.organizations.funds.criteria) {
            delete values.criteria;
        }

        if (!$rootScope.appConfigs.features.organizations.funds.formula_products) {
            delete values.formula_products;
        }

        $ctrl.form = FormBuilderService.build(values, (form) => {
            $ctrl.criteriaEditor.saveCriteria().then(async (success) => {
                if (!success) {
                    return form.unlock();
                }

                try {
                    await $ctrl.faqEditor.validate();
                } catch (e) {
                    PushNotificationsService.danger('Error!', typeof e == 'string' ? e : e.message || '');
                    return form.unlock();
                };

                let promise;
                const { values } = form;

                if (mediaFile) {
                    let res = await MediaService.store('fund_logo', mediaFile);

                    $ctrl.media = res.data.data;
                    values.media_uid = $ctrl.media.uid;
                }

                values.formula_products = form.products.map(product => product.id);
                values.allow_direct_requests = (values.application_method != 'external') || values.allow_direct_requests;

                if ($ctrl.fund) {
                    promise = FundService.update(
                        $stateParams.organization_id,
                        $stateParams.id,
                        { ...values, ...$ctrl.findMethod(values.application_method).configs || {} }
                    );
                } else {
                    promise = FundService.store(
                        $stateParams.organization_id,
                        { ...values, ...$ctrl.findMethod(values.application_method).configs || {} }
                    );
                }

                promise.then(() => {
                    $state.go('organization-funds', { organization_id: $stateParams.organization_id });
                }, (res) => {
                    $timeout(() => {
                        form.errors = res.data.errors;
                        form.unlock();
                    }, 0);
                });
            });
        }, true);

        if ($ctrl.fund && $ctrl.fund.logo) {
            MediaService.read($ctrl.fund.logo.uid).then((res) => $ctrl.media = res.data.data);
        }

        ProductService.listAll({
            per_page: 1000,
            unlimited_stock: 1,
            simplified: 1,
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
        'PushNotificationsService',
        'MediaService',
        FundsEditComponent
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html'
};