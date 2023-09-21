const sortBy = require('lodash/sortBy');

const FundsEditComponent = function(
    $state,
    $scope,
    $timeout,
    $stateParams,
    $rootScope,
    FundService,
    MediaService,
    FormBuilderService,
    PushNotificationsService,
) {
    const $ctrl = this;
    let mediaFile = null;

    $ctrl.criteriaEditor = null;
    $ctrl.faqEditor = null

    $ctrl.applicationMethods = [{
        key: 'application_form',
        name: 'Aanvraagformulier',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 1,
            allow_prevalidations: 0,
            allow_direct_requests: 1,
        },
    }, {
        key: 'activation_codes',
        name: 'Activatiecodes',
        default_button_text: "Activeren",
        configs: {
            allow_fund_requests: 0,
            allow_prevalidations: 1,
            allow_direct_requests: 1,
        },
    }, {
        key: 'all',
        name: 'Aanvraagformulier en activatiecodes',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 1,
            allow_prevalidations: 1,
            allow_direct_requests: 1,
        },
    }, {
        key: 'none',
        name: 'Geen aanvraagformulier en activatiecodes',
        default_button_text: "Aanvragen",
        configs: {
            allow_fund_requests: 0,
            allow_prevalidations: 0,
            allow_direct_requests: 0,
        },
    }];

    $ctrl.fundTypes = [{
        key: 'budget',
        name: 'Waardebon'
    }, {
        key: 'subsidies',
        name: 'Kortingspas'
    }, {
        key: 'external',
        name: 'Informatief (met doorlink)'
    }];

    $ctrl.descriptionPositions = [{
        value: 'replace',
        name: 'Standaard content overschrijven',
    }, {
        value: 'before',
        name: 'Voor de standaard content tonen',
    }, {
        value: 'after',
        name: 'Na de standaard content tonen',
    }];

    $ctrl.externalFundPageTypes = [{
        value: false,
        name: 'Interne pagina',
    }, {
        value: true,
        name: 'Externe pagina',
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

    $ctrl.addProduct = () => {
        $ctrl.form.values.formula_products.push({
            product_id: null,
            record_type_key_multiplier: null,
        });
        $ctrl.updateProductOptions();
    };

    $ctrl.removeProduct = (item) => {
        let index;

        if ((index = $ctrl.form.values.formula_products.indexOf(item)) != -1) {
            $ctrl.form.values.formula_products.splice(index, 1);
        }

        $ctrl.updateProductOptions();
    };

    $scope.$watch('$ctrl.form.values.formula_products', (products) => {
        if (products && Array.isArray(products)) {
            $ctrl.updateProductOptions();
        }
    }, true);

    $ctrl.updateProductOptions = () => {
        $timeout(() => {
            let productOptions = $ctrl.products.filter(product => {
                return $ctrl.form.values.formula_products.map(
                    item => item.product_id ? item.product_id : false
                ).filter(id => !!id).indexOf(product.id) === -1;
            });

            $ctrl.productOptions = [];
            $ctrl.form.values.formula_products.forEach((el, $index) => {
                const product = el.product_id ? $ctrl.products.filter(item => item.id == el.product_id)[0] : false;

                $ctrl.productOptions[$index] = sortBy(productOptions.concat(product ? [product] : []), (product) => {
                    return product.name;
                });
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

    $ctrl.$onInit = function() {
        const values = $ctrl.fund ? FundService.apiResourceToForm($ctrl.fund) : {
            default_validator_employee_id: null,
            auto_requests_validation: false,
            formula_products: [],
            criteria: [],
            faq: [],
            state: $ctrl.fundStates[0].value,
            description_position: $ctrl.descriptionPositions[0]?.value,
            type: 'budget',
            application_method: 'application_form',
            request_btn_text: $ctrl.findMethod('application_form').default_button_text,
            allow_direct_requests: true,
            start_date: moment().add(6, 'days').format('DD-MM-YYYY'),
            end_date: moment().add(1, 'years').format('DD-MM-YYYY'),
            external_page: false,

            // contact information
            email_required: true,
            contact_info_enabled: true,
            contact_info_required: true,
            contact_info_message_custom: false,
            contact_info_message_text: '',
        };

        $ctrl.validators.unshift({
            id: null,
            email: "Geen",
        });

        $ctrl.recordTypesMultiplier = $ctrl.recordTypes.map((recordType) => ({
            ...recordType, name: `Vermenigvuldig met: ${recordType.name}`,
        }));

        $ctrl.recordTypesMultiplier.unshift({
            key: null,
            name: "Wijs 1 tegoed",
        });

        if (!$rootScope.appConfigs.features.organizations.funds.criteria) {
            delete values.criteria;
        }

        if (!$rootScope.appConfigs.features.organizations.funds.formula_products) {
            delete values.formula_products;
        }

        $ctrl.media = $ctrl.fund?.logo;

        $ctrl.form = FormBuilderService.build(values, (form) => {
            const onError = (res) => {
                form.errors = res.data.errors;
                form.unlock();
            };

            const onCriteriaSaved = async (success) => {
                if (!success) {
                    return form.unlock();
                }

                try {
                    await $ctrl?.faqEditor?.validate();
                } catch (e) {
                    PushNotificationsService.danger('Error!', typeof e == 'string' ? e : e.message || '');
                    return form.unlock();
                }

                const { values } = form;

                if (mediaFile) {
                    const res = await MediaService.store('fund_logo', mediaFile);
                    $ctrl.media = res.data.data;
                    values.media_uid = $ctrl.media.uid;
                }

                const data = {
                    ...values,
                    ...$ctrl.findMethod(values.application_method).configs || {},
                };

                if ($ctrl.fund) {
                    return FundService.update($stateParams.organization_id, $stateParams.id, data).then(() => {
                        $state.go('funds-show', { organization_id: $stateParams.organization_id, id: $ctrl.fund.id });
                        PushNotificationsService.success('Gelukt!', 'Het fonds is aangepast!');
                    }, onError)
                }

                FundService.store($stateParams.organization_id, data).then(() => {
                    $state.go('organization-funds', { organization_id: $stateParams.organization_id });
                    PushNotificationsService.success('Gelukt!', 'Een fonds is aangemaakt!');
                }, onError);
            }

            if ($rootScope.appConfigs.features.organizations.funds.criteria) {
                return $ctrl.criteriaEditor.saveCriteria().then(onCriteriaSaved);
            }

            onCriteriaSaved(true);
        }, true);

        if ($rootScope.appConfigs.features.organizations.funds.formula_products) {
            $ctrl.products = $ctrl.products.map((product) => ({
                id: product.id,
                price: product.price,
                name: `${product.name} - €${product.price} (${product.organization.name})`,
            }));

            $ctrl.updateProductOptions();
        }
    };
};

module.exports = {
    bindings: {
        fund: '<',
        tags: '<',
        products: '<',
        fundStates: '<',
        validators: '<',
        recordTypes: '<',
        organization: '<',
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
        'MediaService',
        'FormBuilderService',
        'PushNotificationsService',
        FundsEditComponent,
    ],
    templateUrl: 'assets/tpl/pages/funds-edit.html',
};
