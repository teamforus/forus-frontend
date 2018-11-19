let repackResponse = (promise) => {
    return new Promise((resolve, reject) => {
        promise.then((res) => {
            resolve(res.data.data ? res.data.data : res.data);
        }, reject);
    });
}

module.exports = ['$stateProvider', 'appConfigs', function($stateProvider, appConfigs) {
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
            productCategories: ['ProductCategoryService', function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
            }]
        }
    });

    $stateProvider.state({
        name: "organizations-edit",
        url: "/organizations/{organization_id}/edit",
        component: "organizationsEditComponent",
        resolve: {
            organization: [
                '$transition$',
                'OrganizationService',
                function(
                    $transition$,
                    OrganizationService
                ) {
                    return repackResponse(
                        OrganizationService.read(
                            $transition$.params().organization_id
                        )
                    );
                }
            ],
            productCategories: [
                'ProductCategoryService',
                function(
                    ProductCategoryService
                ) {
                    return repackResponse(ProductCategoryService.list());
                }
            ]
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
            fundProviders: function($transition$, OrganizationService) {
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
        url: "/organizations/{organization_id}/financial-dashboard/funds/{fund_id}",
        component: "financialDashboardComponent",
        params: {
            fund_id: {
                squash: true,
                value: null
            },
        },
        resolve: {
            fund: function($transition$, FundService) {
                return $transition$.params().fund_id != null ? repackResponse(
                    FundService.read(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id
                    )
                ) : new Promise((res) => res(null));
            },
            funds: function($transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            fundProviders: function($transition$, FundService) {
                if ($transition$.params().fund_id == null) {
                    return new Promise((res) => res(null));
                }

                return repackResponse(
                    FundService.listProviders(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id,
                        'approved'
                    )
                );
            }
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
        url: "/organizations/{organization_id}/transactions",
        component: "transactionsComponent",
        resolve: {
            transactions: function($transition$, TransactionService, appConfigs) {
                return repackResponse(
                    TransactionService.list(
                        appConfigs.panel_type,
                        $transition$.params().organization_id
                    )
                );
            },
        }
    });

    $stateProvider.state({
        name: "transaction",
        url: "/organizations/{organization_id}/transactions/{address}",
        component: "transactionComponent",
        params: {
            fund_id: {
                squash: true,
                value: null
            },
        },
        resolve: {
            transaction: function($transition$, TransactionService, appConfigs) {
                return repackResponse(
                    TransactionService.show(
                        appConfigs.panel_type,
                        $transition$.params().organization_id,
                        $transition$.params().address,
                    )
                );
            }
        }
    });

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
            fundsAvailable: function($transition$, ProviderFundService) {
                return repackResponse(
                    ProviderFundService.listAvailableFunds(
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
                return 'fundsAvailable';
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
        url: '/csv-validation/funds/{fund_id}',
        component: 'csvValidationComonent',
        params: {
            fund_id: {
                squash: true,
                value: null
            },
        },
        resolve: {
            fund: function($transition$, FundService) {
                return $transition$.params().fund_id != null ? repackResponse(
                    FundService.readPublic($transition$.params().fund_id)
                ) : new Promise((res) => res(null));
            },
            funds: function(FundService) {
                return repackResponse(
                    FundService.list()
                );
            },
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

    $stateProvider.state({
        name: "restore-email",
        url: "/identity-restore?token",
        controller: [
            '$rootScope',
            '$state',
            'IdentityService',
            'CredentialsService',
            'appConfigs',
            function(
                $rootScope,
                $state,
                IdentityService,
                CredentialsService,
                appConfigs
            ) {
                IdentityService.authorizeAuthEmailToken(
                    'panel-' + appConfigs.panel_type,
                    $state.params.token
                ).then(function(res) {
                    CredentialsService.set(res.data.access_token);
                    $rootScope.loadAuthUser();
                    $state.go('home');
                }, () => {
                    alert("Token expired or unknown.");
                    $state.go('home');
                });
            }
        ],
        data: {
            token: null
        }
    });

    if (appConfigs.panel_type == 'provider' || appConfigs.panel_type == 'sponsor') {
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
    }
}];