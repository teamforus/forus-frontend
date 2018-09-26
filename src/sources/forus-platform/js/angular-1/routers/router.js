module.exports = function($stateProvider) {
    let repackResponse = (promise) => {
        return new Promise((resolve, reject) => {
            promise.then((res) => {
                resolve(res.data.data ? res.data.data : res.data);
            }, reject);
        });
    }

    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent"
    });

    /**
     * Organizations
     */
    $stateProvider.state({
        name: "organizations",
        url: "/organizations",
        component: "organizationsComponent"
    });

    $stateProvider.state({
        name: "organizations-create",
        url: "/organizations/create",
        component: "organizationsEditComponent",
        resolve: {
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "organizations-edit",
        url: "/organizations/{organization_id}/edit",
        component: "organizationsEditComponent",
        resolve: {
            organization: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.read(
                        $transition$.params().organization_id
                    )
                );
            },
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "organization-funds",
        url: "/organizations/{organization_id}/funds",
        component: "fundsMyComponent",
        resolve: {
            funds: function($transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            fundLevel: () => "organizationFunds"
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "organization-providers",
        url: "/organizations/{organization_id}/providers",
        component: "organizationProvidersComponent",
        resolve: {
            providerFunds: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.listProviders(
                        $transition$.params().organization_id
                    )
                );
            },
            fundLevel: () => "organizationFunds"
        }
    });

    // Organization validators
    $stateProvider.state({
        name: "validators",
        url: "/organizations/{organization_id}/validators",
        component: "organizationValidatorsComponent",
        resolve: {
            validators: function($transition$, OrganizationValidatorService) {
                return repackResponse(
                    OrganizationValidatorService.list(
                        $transition$.params().organization_id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "validators-create",
        url: "/organizations/{organization_id}/validators/create",
        component: "organizationValidatorsEditComponent"
    });

    $stateProvider.state({
        name: "validators-edit",
        url: "/organizations/{organization_id}/validators/{id}/edit",
        component: "organizationValidatorsEditComponent",
        resolve: {
            validator: function($transition$, OrganizationValidatorService) {
                return repackResponse(
                    OrganizationValidatorService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "financial-dashboard",
        url: "/organizations/{organization_id}/financial-dashboard",
        component: "fundsComponent",
        resolve: {
            funds: function($transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            fundLevel: () => "financialDashboard"
        }
    });

    /**
     * Offices
     */
    $stateProvider.state({
        name: "offices",
        url: "/organization/{organization_id}/offices",
        component: "officesComponent",
        resolve: {
            organization: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.read(
                        $transition$.params().organization_id
                    )
                );
            },
            offices: function($transition$, OfficeService) {
                return repackResponse(
                    OfficeService.list(
                        $transition$.params().organization_id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "offices-create",
        url: "/organization/{organization_id}/offices/create",
        component: "officesEditComponent"
    });

    $stateProvider.state({
        name: "offices-edit",
        url: "/organization/{organization_id}/offices/{office_id}/edit",
        component: "officesEditComponent",
        resolve: {
            office: function($transition$, OfficeService) {
                return repackResponse(
                    OfficeService.read(
                        $transition$.params().organization_id,
                        $transition$.params().office_id
                    )
                );
            }
        }
    });

    /**
     * Funds
     */
    $stateProvider.state({
        name: "funds",
        url: "/funds",
        component: "fundsComponent",
        resolve: {
            funds: function($transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            fundLevel: () => "funds"
        }
    });

    $stateProvider.state({
        name: "funds-create",
        url: "/organizations/{organization_id}/funds/create",
        component: "fundsEditComponent",
        resolve: {
            fundStates: function(FundService) {
                return FundService.states();
            },
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "funds-show",
        url: "/organizations/{organization_id}/funds/{fund_id}",
        component: "fundsShowComponent",
        resolve: {
            fund: function($transition$, FundService) {
                return repackResponse(
                    FundService.read(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id
                    )
                );
            },
            fundLevel: () => "fundShow"
        }
    });

    $stateProvider.state({
        name: "funds-edit",
        url: "/organizations/{organization_id}/funds/{fund_id}/edit",
        component: "fundsEditComponent",
        resolve: {
            fund: function($transition$, FundService) {
                return repackResponse(
                    FundService.read(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id
                    )
                );
            },
            fundStates: function(FundService) {
                return FundService.states();
            },
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    /**
     * Transactions
     */
    $stateProvider.state({
        name: "transactions",
        url: "/transactions",
        component: "transactionsComponent"
    });

    /**
     * Transactions
     */
    $stateProvider.state({
        name: "products",
        url: "/organizations/{organization_id}/products",
        component: "productsComponent",
        resolve: {
            organization: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.read(
                        $transition$.params().organization_id
                    )
                );
            },
            products: function($transition$, ProductService) {
                return repackResponse(
                    ProductService.list(
                        $transition$.params().organization_id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "products-create",
        url: "/organizations/{organization_id}/products/create",
        component: "productsEditComponent",
        resolve: {
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "products-edit",
        url: "/organizations/{organization_id}/products/{id}/edit",
        component: "productsEditComponent",
        resolve: {
            product: function($transition$, ProductService) {
                return repackResponse(
                    ProductService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            },
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "products-show",
        url: "/organizations/{organization_id}/products/{id}",
        component: "productsShowComponent",
        resolve: {
            product: function($transition$, ProductService) {
                return repackResponse(
                    ProductService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "sign-up",
        url: "/sign-up",
        component: "signUpComponent",
        resolve: {
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }
        }
    });

    $stateProvider.state({
        name: "provider-funds-available",
        url: "/organizations/{organization_id}/provider/funds/available",
        component: "providerFundsAvailableComponent",
        resolve: {
            organization: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.read(
                        $transition$.params().organization_id
                    )
                );
            },
            funds: function($transition$, ProviderFundService) {
                return repackResponse(
                    ProviderFundService.listAvailableFunds(
                        $transition$.params().organization_id
                    )
                );
            },
            pendingFunds: function($transition$, ProviderFundService) {
                return repackResponse(
                    ProviderFundService.listFunds(
                        $transition$.params().organization_id,
                        'pending'
                    )
                );
            },
            fundLevel: function() {
                return 'fundsAvailable';
            }
        }
    });

    $stateProvider.state({
        name: "provider-funds",
        url: "/organizations/{organization_id}/provider/funds",
        component: "providerFundsComponent",
        resolve: {
            organization: function($transition$, OrganizationService) {
                return repackResponse(
                    OrganizationService.read(
                        $transition$.params().organization_id
                    )
                );
            },
            funds: function($transition$, ProviderFundService) {
                return repackResponse(
                    ProviderFundService.listFunds(
                        $transition$.params().organization_id
                    )
                );
            },
            fundLevel: function() {
                return 'providerFunds';
            }
        }
    });

    $stateProvider.state({
        name: 'provider-identities',
        url: "/organizations/{organization_id}/provider/identities",
        component: 'providerIdentitiesComponent',
        resolve: {
            providerIdentities: function($transition$, ProviderIdentityService) {
                return repackResponse(
                    ProviderIdentityService.list(
                        $transition$.params().organization_id
                    )
                );
            }
        }
    });

    $stateProvider.state({
        name: "provider-identity-create",
        url: "/organizations/{organization_id}/provider/identity/create",
        component: "providerIdentityEditComponent"
    });

    $stateProvider.state({
        name: "provider-identity-edit",
        url: "/organizations/{organization_id}/provider/identity/{id}/edit",
        component: "providerIdentityEditComponent",
        resolve: {
            providerIdentity: function($transition$, ProviderIdentityService) {
                return repackResponse(
                    ProviderIdentityService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            }
        }
    });

    // Validators
    $stateProvider.state({
        name: 'csv-validation',
        url: '/csv-validation',
        component: 'csvValidationComonent',
        resolve: {
            prevalidations: function(PrevalidationService) {
                return repackResponse(
                    PrevalidationService.list()
                );
            },
            recordTypes: function(RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            }
        }
    });

    // Validators
    $stateProvider.state({
        name: 'validation-requests',
        url: '/validation-requests',
        component: 'validationRequestsComonent',
        resolve: {
            validatorRequests: function(ValidatorRequestService) {
                return repackResponse(
                    ValidatorRequestService.list()
                );
            }
        }
    });

    $stateProvider.state({
        name: 'validation-request',
        url: '/validation-request/{id}',
        component: 'validationRequestComonent',
        resolve: {
            validatorRequest: function($transition$, ValidatorRequestService) {
                return repackResponse(
                    ValidatorRequestService.read(
                        $transition$.params().id
                    )
                );
            }
        }
    });
};