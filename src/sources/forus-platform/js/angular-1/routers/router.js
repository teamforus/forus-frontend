let repackResponse = (promise) => {
    return new Promise((resolve, reject) => {
        promise.then((res) => {
            resolve(res.data.data ? res.data.data : res.data);
        }, reject);
    });
}

let repackPagination = (promise) => {
    return new Promise((resolve, reject) => {
        promise.then((res) => {
            resolve(res.data);
        }, reject);
    });
}

let objectOnlyKeys = (obj, keys) => {
    let out = {};
    keys.forEach(key => out[key] = obj[key]);
    return out;
};

/**
 * Permission middleware
 *
 * @param {string} messageKey Error message key
 * @param {string|string[]} permissions List all required permissions
 * @param {bool} permissionsAll Require all permissions from the list
 * @param {string} dependencyKey Other resolver dependency
 * @param {function|bool} dependencyResolver Custom organization resolver from dependency
 */
let permissionMiddleware = (
    messageKey,
    permissions,
    permissionsAll = true,
    dependencyKey = 'organization',
    dependencyResolver = false
) => {
    return [
        dependencyKey,
        '$state',
        'PermissionsService', (
            dependency,
            $state,
            PermissionsService
        ) => {
            let organization;

            if (dependencyResolver && typeof(dependencyResolver) == 'function') {
                organization = dependencyResolver(dependency);
            } else {
                if (dependencyKey == 'organization') {
                    organization = dependency;
                } else if (dependencyKey == 'fund') {
                    organization = dependency.organization;
                }
            }

            if (!PermissionsService.hasPermission(organization, permissions, permissionsAll)) {
                setTimeout(() => {
                    $state.go('no-permission', {
                        message: messageKey
                    });
                }, 0);

                return false;
            }

            return true;
        }
    ];
};

let organziationResolver = (uriKey = 'organization_id', apiDependencies) => {
    return [
        '$transition$',
        'OrganizationService',
        function(
            $transition$,
            OrganizationService
        ) {
            return repackResponse(
                OrganizationService.read($transition$.params()[uriKey])
            );
        }
    ];
};

module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {
    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent"
    });

    $stateProvider.state({
        name: "no-permission",
        url: "/no-permission/{message}",
        component: "noPermissionComponent",
        resolve: {
            message: ['$filter', '$transition$', function($filter, $transition$) {
                return {
                    title: $filter('translate')(
                        'permissions.' + $transition$.params().message + '.title'
                    ),
                    description: $filter('translate')(
                        'permissions.' + $transition$.params().message + '.description'
                    )
                };
            }]
        }
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
            businessTypes: ['BusinessTypeService', function(BusinessTypeService) {
                return repackResponse(BusinessTypeService.list({
                    per_page: 9999
                }));
            }]
        }
    });

    $stateProvider.state({
        name: "organizations-edit",
        url: "/organizations/{id}/edit",
        component: "organizationsEditComponent",
        resolve: {
            organization: organziationResolver('id'),
            permission: permissionMiddleware('organization-edit', 'manage_organization'),
            businessTypes: ['BusinessTypeService', function(BusinessTypeService) {
                return repackResponse(BusinessTypeService.list({
                    per_page: 9999
                }));
            }]
        }
    });

    $stateProvider.state({
        name: "organization-funds",
        url: "/organizations/{organization_id}/funds",
        component: "fundsMyComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('organization-funds', [
                'manage_funds', 'view_finances', 'view_funds',
            ], false),
            funds: ['permission', '$transition$', 'FundService', function(permission, $transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            }],
            fundLevel: [('permission'), (permission) => "organizationFunds"]
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "organization-providers",
        url: "/organizations/{organization_id}/providers?fund_id",
        component: "organizationProvidersComponent",
        params: {
            fund_id: {
                squash: true,
                value: null
            },
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            fundProviders: function(permission, $transition$, OrganizationService) {
                return $transition$.params().fund_id != null ? repackPagination(
                    OrganizationService.listProviders(
                        $transition$.params().organization_id, {
                            fund_id: $transition$.params().fund_id
                        })
                ) : new Promise((res) => res(null));
            },
            fund: function(permission, $transition$, FundService) {
                return $transition$.params().fund_id != null ? repackResponse(
                    FundService.readPublic($transition$.params().fund_id)
                ) : new Promise((res) => res(null));
            },
            funds: function(permission, $transition$, FundService) {
                return repackResponse(
                    FundService.list($transition$.params().organization_id)
                );
            },
            fundLevel: (permission) => "organizationFunds"
        }
    });

    // Organization employees
    $stateProvider.state({
        name: "employees",
        url: "/organizations/{organization_id}/employees",
        component: "organizationEmployeesComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('employees-list', 'manage_employees'),
            employees: function(permission, $transition$, OrganizationEmployeesService) {
                return repackResponse(
                    OrganizationEmployeesService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            roles: function(permission, RoleService) {
                return repackResponse(
                    RoleService.list()
                );
            }
        }
    });

    $stateProvider.state({
        name: "financial-dashboard",
        url: "/organizations/{organization_id}/financial-dashboard/funds?fund_id",
        component: "financialDashboardComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('financial-dashboard', 'view_finances'),
            fund: function(permission, $transition$, FundService) {
                return $transition$.params().fund_id != null ? repackResponse(
                    FundService.read(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id
                    )
                ) : new Promise((res) => res(null));
            },
            funds: function(permission, $transition$, FundService) {
                return repackResponse(
                    FundService.list(
                        $transition$.params().organization_id
                    )
                );
            },
            fundProviders: function(permission, $transition$, FundService) {
                if ($transition$.params().fund_id == null) {
                    return new Promise((res) => res(null));
                }

                return repackPagination(
                    FundService.listProviders(
                        $transition$.params().organization_id,
                        $transition$.params().fund_id,
                        'approved'
                    )
                );
            },
            productCategories: ['ProductCategoryService', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.list({
                    parent_id: 'null'
                }));
            }]
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
            organization: organziationResolver(),
            offices: [
                'organization',
                '$transition$',
                'PermissionsService',
                'OfficeService', (
                    organization,
                    $transition$,
                    PermissionsService,
                    OfficeService
                ) => {
                    if (!PermissionsService.hasPermission(organization, 'manage_offices')) {
                        return false;
                    }

                    return repackResponse(
                        OfficeService.list(
                            $transition$.params().organization_id
                        )
                    );
                }
            ]
        }
    });

    $stateProvider.state({
        name: "offices-create",
        url: "/organization/{organization_id}/offices/create",
        component: "officesEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('offices-create', 'manage_offices'),
        }
    });

    $stateProvider.state({
        name: "offices-edit",
        url: "/organization/{organization_id}/offices/{id}/edit",
        component: "officesEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('offices-edit', 'manage_offices'),
            office: function(permission, $transition$, OfficeService) {
                return repackResponse(
                    OfficeService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            }
        }
    });

    /**
     * Funds
     */
    $stateProvider.state({
        name: "funds-create",
        url: "/organizations/{organization_id}/funds/create",
        component: "fundsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('funds-create', 'manage_funds'),
            fundStates: function(permission, FundService) {
                return FundService.states();
            },
            productCategories: function(permission, ProductCategoryService) {
                return repackResponse(ProductCategoryService.listAll());
            }
        }
    });

    /*$stateProvider.state({
        name: "funds-show",
        url: "/organizations/{organization_id}/funds/{id}",
        component: "fundsShowComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('funds-show', [
                'manage_funds', 'view_finances'
            ], false),
            fund: function(permission, $transition$, FundService) {
                return repackResponse(
                    FundService.read(
                        $transition$.params().organization_id,
                        $transition$.params().id
                    )
                );
            },
            fundLevel: (permission) => "fundShow"
        }
    });*/

    $stateProvider.state({
        name: "funds-edit",
        url: "/organizations/{organization_id}/funds/{id}/edit",
        component: "fundsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('funds-edit', 'manage_funds'),
            fund: [
                '$transition$',
                'FundService',
                function(
                    $transition$,
                    FundService
                ) {
                    return repackResponse(
                        FundService.read(
                            $transition$.params().organization_id,
                            $transition$.params().id
                        )
                    );
                }
            ],
            fundStates: function(FundService) {
                return FundService.states();
            },
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.listAll());
            }
        }
    });

    /**
     * Vouchers
     */
    $stateProvider.state({
        name: "vouchers",
        url: "/organizations/{organization_id}/vouchers?fund_id",
        component: "vouchersComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
            funds: [
                'permission', '$transition$', 'FundService',
                function(permission, $transition$, FundService) {
                    return repackResponse(
                        FundService.list(
                            $transition$.params().organization_id, {
                                per_page: 1000
                            }
                        )
                    );
                }
            ],
            fund: [
                'funds', '$transition$',
                function(funds, $transition$) {
                    // $state.params.token
                    let fund_id = $transition$.params().fund_id;

                    return $transition$.params(), fund_id ? funds.filter(
                        fund => fund.id == $transition$.params().fund_id
                    )[0] || false : null;
                }
            ],
        }
    });

    /**
     * Vouchers
     */
    $stateProvider.state({
        name: "product-vouchers",
        url: "/organizations/{organization_id}/product-vouchers?fund_id",
        component: "productVouchersComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
            funds: [
                'permission', '$transition$', 'FundService',
                function(permission, $transition$, FundService) {
                    return repackResponse(
                        FundService.list(
                            $transition$.params().organization_id, {
                                per_page: 1000
                            }
                        )
                    );
                }
            ],
            fund: [
                'funds', '$transition$',
                function(funds, $transition$) {
                    // $state.params.token
                    let fund_id = $transition$.params().fund_id;

                    return $transition$.params(), fund_id ? funds.filter(
                        fund => fund.id == $transition$.params().fund_id
                    )[0] || false : null;
                }
            ],
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
            organization: organziationResolver(),
            permission: permissionMiddleware('transactions-list', 'view_finances')
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
            organization: organziationResolver(),
            permission: permissionMiddleware('transactions-show', 'view_finances'),
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
            organization: organziationResolver(),
            permission: permissionMiddleware('products-list', 'manage_products'),
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
            organization: organziationResolver(),
            permission: permissionMiddleware('products-create', 'manage_products'),
            productCategories: function(ProductCategoryService) {
                return repackResponse(ProductCategoryService.list());
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
        name: "products-edit",
        url: "/organizations/{organization_id}/products/{id}/edit",
        component: "productsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('products-edit', 'manage_products'),
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
            organization: organziationResolver(),
            permission: permissionMiddleware('products-show', 'manage_products'),
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
            organization: organziationResolver(),
            permission: permissionMiddleware('provider-funds-list', 'manage_provider_funds'),
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

    // Validators
    $stateProvider.state({
        name: 'csv-validation',
        url: '/csv-validation/funds/{fund_id}?page&q',
        component: 'csvValidationComponent',
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
            prevalidations: function($transition$, PrevalidationService) {
                return repackPagination(
                    PrevalidationService.list(objectOnlyKeys($transition$.params(), [
                        'page', 'q'
                    ]))
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
        name: 'fund-requests',
        url: '/organizations/{organization_id}/requests',
        component: 'fundRequestsComponent',
        params: {
            organization_id: null,
        },
        resolve: {
            organization: organziationResolver(),
        }
    });

    $stateProvider.state({
        name: 'validation-request',
        url: '/validation-request/{id}',
        component: 'validationRequestComponent',
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
        name: 'email-preferences',
        url: '/email/preferences',
        component: 'emailPreferencesComponent'
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
                    appConfigs.client_key + '_' + appConfigs.panel_type,
                    $state.params.token
                ).then(function(res) {
                    CredentialsService.set(res.data.access_token);
                    $rootScope.loadAuthUser();
                    $state.go('home');
                }, () => {
                    alert("Helaas, het is niet gelukt om in te loggen. De link is reeds gebruikt of niet meer geldig. Probeer het opnieuw met een andere link.");
                    $state.go('home');
                });
            }
        ],
        data: {
            token: null
        }
    });

    $stateProvider.state({
        name: "confirmation-email",
        url: "/confirmation/email/{token}",
        controller: [
            '$rootScope',
            '$state',
            'IdentityService',
            'CredentialsService',
            function(
                $rootScope,
                $state,
                IdentityService,
                CredentialsService
            ) {
                IdentityService.exchangeConfirmationToken(
                    $state.params.token
                ).then(function(res) {
                    CredentialsService.set(res.data.access_token);
                    $rootScope.loadAuthUser();
                    $state.go('home', {
                        confirmed: 1
                    });
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

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token",
        controller: [
            '$state', '$rootScope', 'IdentityService', 'CredentialsService',
            function(
                $state, $rootScope, IdentityService, CredentialsService
            ) {
                IdentityService.exchangeShortToken(
                    $state.params.token
                ).then(res => {
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

    if (['provider', 'sponsor'].indexOf(appConfigs.panel_type) != -1) {
        $stateProvider.state({
            name: "sign-up",
            url: "/sign-up?fundId",
            component: "signUpComponent",
            resolve: {
                businessTypes: ['BusinessTypeService', function(BusinessTypeService) {
                    return repackResponse(BusinessTypeService.list({
                        per_page: 9999
                    }));
                }]
            }
        });
    }

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];