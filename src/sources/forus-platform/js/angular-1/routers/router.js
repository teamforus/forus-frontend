let repackResponse = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(
        res.data.data ? res.data.data : res.data
    ), reject)
});

let repackPagination = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data), reject);
});

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

let organziationResolver = (uriKey = 'organization_id') => {
    return ['$transition$', 'OrganizationService', (
        $transition$, OrganizationService
    ) => repackResponse(
        OrganizationService.read($transition$.params()[uriKey])
    )];
};

module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', (
    $stateProvider, $locationProvider, appConfigs
) => {
    $stateProvider.state({
        name: "home",
        url: "/?digid_error",
        component: "homeComponent",
        params: {
            confirmed: null,
            digid_error: null
        },
    });

    $stateProvider.state({
        name: "no-permission",
        url: "/no-permission/{message}",
        component: "noPermissionComponent",
        resolve: {
            message: ['$filter', '$transition$', ($filter, $transition$) => ({
                title: $filter('translate')(
                    'permissions.' + $transition$.params().message + '.title'
                ),
                description: $filter('translate')(
                    'permissions.' + $transition$.params().message + '.description'
                )
            })]
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
            businessTypes: ['BusinessTypeService', (
                BusinessTypeService
            ) => repackResponse(BusinessTypeService.list({
                per_page: 9999
            }))]
        }
    });

    $stateProvider.state({
        name: "organizations-edit",
        url: "/organizations/{id}/edit",
        component: "organizationsEditComponent",
        resolve: {
            permission: permissionMiddleware('organization-edit', 'manage_organization'),
            organization: organziationResolver('id'),
            businessTypes: ['BusinessTypeService', (
                BusinessTypeService
            ) => repackResponse(BusinessTypeService.list({
                per_page: 9999
            }))]
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
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(FundService.list(
                $transition$.params().organization_id
            ))],
            fundLevel: [('permission'), (permission) => "organizationFunds"]
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "organization-providers",
        url: "/organizations/{organization_id}/providers?fund_id",
        component: "organizationProvidersComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(
                FundService.list($transition$.params().organization_id)
            )],
            fund: ['funds', '$transition$', (
                funds, $transition$
            ) => funds.filter(
                fund => fund.id == $transition$.params().fund_id
            )[0] || null],
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "fund-provider",
        url: "/organizations/{organization_id}/funds/{fund_id}/providers/{fund_provider_id}",
        component: "fundProviderComponent",
        params: {
            organization_id: null,
            fund_id: null,
            fund_provider_id: null
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            fundProvider: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(FundService.readProvider(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id
            )) : new Promise((res) => res(null))],
            fund: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(
                FundService.readPublic($transition$.params().fund_id)
            ) : new Promise((res) => res(null))]
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
            employees: ['permission', '$transition$', 'OrganizationEmployeesService', (
                permission, $transition$, OrganizationEmployeesService
            ) => repackResponse(OrganizationEmployeesService.list(
                $transition$.params().organization_id
            ))],
            roles: ['permission', 'RoleService', (
                permission, RoleService
            ) => repackResponse(RoleService.list())]
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
            fund: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => {
                return $transition$.params().fund_id != null ? repackResponse(FundService.read(
                    $transition$.params().organization_id,
                    $transition$.params().fund_id
                )) : new Promise((res) => res(null));
            }],
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(FundService.list(
                $transition$.params().organization_id
            ))],
            fundProviders: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => {
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
            }],
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.list({
                parent_id: 'null'
            }))]
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
            offices: ['organization', '$transition$', 'PermissionsService', 'OfficeService', (
                organization, $transition$, PermissionsService, OfficeService
            ) => {
                if (!PermissionsService.hasPermission(organization, 'manage_offices')) {
                    return false;
                }

                return repackResponse(OfficeService.list(
                    $transition$.params().organization_id
                ));
            }]
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
            office: ['permission', '$transition$', 'OfficeService', (
                permission, $transition$, OfficeService
            ) => repackResponse(OfficeService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))]
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
            fundStates: ['permission', 'FundService', (
                permission, FundService
            ) => FundService.states()],
            productCategories: ['permission', 'ProductCategoryService', (
                permission, ProductCategoryService
            ) => repackResponse(ProductCategoryService.listAll())]
        }
    });

    /* $stateProvider.state({
        name: "funds-show",
        url: "/organizations/{organization_id}/funds/{id}",
        component: "fundsShowComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('funds-show', [
                'manage_funds', 'view_finances'
            ], false),
            fund: [
                'permission', '$transition$', 'FundService', (
                    permission, $transition$, FundService
                ) => {
                    return repackResponse(
                        FundService.read(
                            $transition$.params().organization_id,
                            $transition$.params().id
                        )
                    );
                }
            ],
            fundLevel: ['permission', (permission) => "fundShow"]
        }
    }); */

    $stateProvider.state({
        name: "funds-edit",
        url: "/organizations/{organization_id}/funds/{id}/edit",
        component: "fundsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('funds-edit', 'manage_funds'),
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.listAll())],
            fundStates: ['FundService', (
                FundService
            ) => FundService.states()]
        }
    });
    if (!appConfigs.hide_voucher_generators) {
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
    }

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
            fund_id: null,
        },
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('transactions-show', 'view_finances'),
            transaction: ['$transition$', 'TransactionService', 'appConfigs', (
                $transition$, TransactionService, appConfigs
            ) => repackResponse(TransactionService.show(
                appConfigs.panel_type,
                $transition$.params().organization_id,
                $transition$.params().address,
            ))]
        }
    });

    $stateProvider.state({
        name: "products",
        url: "/organizations/{organization_id}/products",
        component: "productsComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('products-list', 'manage_products'),
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.list(
                $transition$.params().organization_id
            ))]
        }
    });

    $stateProvider.state({
        name: "products-create",
        url: "/organizations/{organization_id}/products/create",
        component: "productsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('products-create', 'manage_products'),
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.list())],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.list(
                $transition$.params().organization_id
            ))]
        }
    });

    $stateProvider.state({
        name: "products-edit",
        url: "/organizations/{organization_id}/products/{id}/edit",
        component: "productsEditComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('products-edit', 'manage_products'),
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.list())]
        }
    });

    $stateProvider.state({
        name: "products-show",
        url: "/organizations/{organization_id}/products/{id}",
        component: "productsShowComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('products-show', 'manage_products'),
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))]
        }
    });

    $stateProvider.state({
        name: "provider-funds",
        url: "/organizations/{organization_id}/provider/funds",
        component: "providerFundsComponent",
        resolve: {
            organization: organziationResolver(),
            permission: permissionMiddleware('provider-funds-list', 'manage_provider_funds'),
            fundsAvailable: ['$transition$', 'ProviderFundService', (
                $transition$, ProviderFundService
            ) => repackResponse(ProviderFundService.listAvailableFunds(
                $transition$.params().organization_id
            ))],
            funds: ['$transition$', 'ProviderFundService', (
                $transition$, ProviderFundService
            ) => repackResponse(ProviderFundService.listFunds(
                $transition$.params().organization_id
            ))],
            fundLevel: () => 'fundsAvailable'
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
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(
                FundService.readPublic($transition$.params().fund_id)
            ) : new Promise((res) => res(null))],
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())],
            prevalidations: ['$transition$', 'PrevalidationService', (
                $transition$, PrevalidationService
            ) => repackPagination(PrevalidationService.list(objectOnlyKeys($transition$.params(), [
                'page', 'q'
            ])))],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())]
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
            validatorRequest: ['$transition$', 'ValidatorRequestService', (
                $transition$, ValidatorRequestService
            ) => repackResponse(ValidatorRequestService.read(
                $transition$.params().id
            ))]
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
        data: {
            token: null
        },
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'appConfigs', (
            $rootScope, $state, IdentityService, CredentialsService, appConfigs
        ) => {
            IdentityService.authorizeAuthEmailToken(
                appConfigs.client_key + '_' + appConfigs.panel_type,
                $state.params.token
            ).then(function(res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser();
                $state.go('home');
            }, () => {
                alert([
                    "Helaas, het is niet gelukt om in te loggen. " +
                    "De link is reeds gebruikt of niet meer geldig. " +
                    "Probeer het opnieuw met een andere link."
                ].join());
                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: "confirmation-email",
        url: "/confirmation/email/{token}",
        data: {
            token: null
        },
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', (
            $rootScope, $state, IdentityService, CredentialsService
        ) => IdentityService.exchangeConfirmationToken(
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
        })]
    });

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token",
        data: {
            token: null
        },
        controller: ['$state', '$rootScope', 'IdentityService', 'CredentialsService', 'PushNotificationsService', (
            $state, $rootScope, IdentityService, CredentialsService, PushNotificationsService
        ) => {
            IdentityService.exchangeShortToken(
                $state.params.token
            ).then(res => {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => {
                    $state.go('home');
                });
            }, () => {
                PushNotificationsService.danger(
                    "Deze link is reeds gebruikt of ongeldig."
                ) & $state.go('home');
            });
        }]
    });

    if (['provider', 'sponsor'].indexOf(appConfigs.panel_type) != -1) {
        $stateProvider.state({
            name: "sign-up",
            url: "/sign-up?fund_id&organization_id&tag",
            component: "signUpComponent",
            params: {
                fund_id: {
                    squash: true,
                    value: null,
                },
                tag: {
                    squash: true,
                    value: null,
                },
                organization_id: {
                    squash: true,
                    value: null
                },
            },
            resolve: {
                businessTypes: ['BusinessTypeService', (
                    BusinessTypeService
                ) => repackResponse(BusinessTypeService.list({
                    per_page: 9999
                }))]
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