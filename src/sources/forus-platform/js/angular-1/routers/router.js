const { pick } = require("lodash");
const targetHome = 'homeStart';
const targetNewSignup = 'newSignup';

const repackResponse = (promise, onError = () => { }) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data.data ? res.data.data : res.data), (res) => {
        onError(res) & reject(res);
    });
});

const repackPagination = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data), reject);
});

const only = (obj = {}, ...args) => {
    return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {});
};

const handleAuthTarget = ($state, target) => {
    if (target[0] == targetHome) {
        $state.go('home', { confirmed: true });

        return true;
    }

    if (target[0] == targetNewSignup) {
        $state.go('sign-up', {
            organization_id: target[1] || undefined,
            fund_id: target[2] || undefined,
            tag: target[3] || undefined,
        });

        return true;
    }

    return false;
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
const permissionMiddleware = (
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

            if (dependencyResolver && typeof (dependencyResolver) == 'function') {
                organization = dependencyResolver(dependency);
            } else {
                if (dependencyKey == 'organization') {
                    organization = dependency;
                } else if (dependencyKey == 'fund') {
                    organization = dependency.organization;
                }
            }

            if (!PermissionsService.hasPermission(organization, permissions, permissionsAll)) {
                return setTimeout(() => $state.go('no-permission', { error: messageKey }), 0);
            }

            return true;
        }
    ];
};

const organizationResolver = (uriKey = 'organization_id') => {
    return ['$transition$', 'OrganizationService', ($transition$, OrganizationService) => {
        return repackResponse(OrganizationService.read($transition$.params()[uriKey]));
    }];
};

// todo: remove later
const organziationResolver = organizationResolver;

const authUserResolver = () => {
    return ['$rootScope', ($rootScope) => $rootScope.loadAuthUser()];
};

const routeParam = (value = null, dynamic = true, squash = true) => {
    return {
        ...{ value },
        ...(squash !== null ? { squash } : {}),
        ...(dynamic !== null ? { dynamic } : {}),
    };
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
        name: "auth-2fa",
        url: "/auth-2fa",
        component: "auth2FAComponent",
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        },
    });

    $stateProvider.state({
        name: "no-permission",
        url: "/no-permission?error",
        component: "noPermissionComponent",
        resolve: {
            message: ['$filter', ($filter) => ({
                title: $filter('translate')('permissions.title'),
                description: $filter('translate')('permissions.description')
            })]
        }
    });

    $stateProvider.state({
        name: "email-confirmed",
        url: "/redirect?email_confirmed",
        component: "emailConfirmedComponent",
    });

    /**
     * Organizations
     */
    $stateProvider.state({
        name: "organizations",
        url: "/organizations",
        controller: ['$rootScope', ($rootScope) => {
            if (!$rootScope.auth_user) {
                $rootScope.loadAuthUser().then((auth_user) => $rootScope.autoSelectOrganization(auth_user));
            } else {
                $rootScope.autoSelectOrganization($rootScope.auth_user)
            }
        }]
    });

    // Provider overview
    $stateProvider.state({
        name: "provider-overview",
        url: "/organizations/{organization_id}/overview",
        component: "providerOverviewComponent",
        resolve: {
            organization: organizationResolver(),
            funds: ['$transition$', 'ProviderFundService', (
                $transition$, ProviderFundService
            ) => repackResponse(ProviderFundService.listFunds(
                $transition$.params().organization_id
            ))],
            employeesTotal: ['$q', '$transition$', 'OrganizationEmployeesService', (
                $q, $transition$, OrganizationEmployeesService
            ) => $q((resolve) => OrganizationEmployeesService.list(
                $transition$.params().organization_id,
                { per_page: 1 }
            ).then(res => resolve(res.data.meta.total)))],
            productsTotal: ['$q', '$transition$', 'ProductService', (
                $q, $transition$, ProductService
            ) => $q((resolve) => ProductService.list(
                $transition$.params().organization_id,
                { per_page: 1 }
            ).then(res => resolve(res.data.meta.total)))],
            transactionsTotal: ['$q', '$transition$', 'appConfigs', 'TransactionService', (
                $q, $transition$, appConfigs, TransactionService
            ) => $q((resolve) => TransactionService.list(
                appConfigs.panel_type,
                $transition$.params().organization_id,
                { per_page: 1 }
            ).then(res => resolve(res.data.meta.total_amount)))]
        }
    });

    $stateProvider.state({
        name: "organizations-view",
        url: "/organization/{id}",
        controller: ['$rootScope', '$transition$', 'OrganizationService', (
            $rootScope, $transition$, OrganizationService
        ) => {
            $rootScope.loadAuthUser().then(() => {
                OrganizationService.use($transition$.params().id);
                $rootScope.redirectToDashboard($transition$.params().id);
            });
        }]
    });

    $stateProvider.state({
        name: "organizations-create",
        url: "/organizations/create",
        component: "organizationsEditComponent",
        resolve: {
            businessTypes: ['BusinessTypeService', (BusinessTypeService) => {
                return repackResponse(BusinessTypeService.list({ per_page: 9999 }));
            }]
        }
    });

    $stateProvider.state({
        name: "organization-security",
        url: "/organizations/{organization_id}/security?view_type",
        component: "organizationSecurityComponent",
        params: {
            view_type: {
                squash: true,
                value: null
            },
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-show', ['view_funds', 'manage_funds', 'view_finances'], false),
        }
    });

    $stateProvider.state({
        name: "organizations-edit",
        url: "/organizations/{organization_id}/edit",
        component: "organizationsEditComponent",
        resolve: {
            permission: permissionMiddleware('organization-edit', 'manage_organization'),
            organization: organizationResolver(),
            businessTypes: ['BusinessTypeService', (BusinessTypeService) => {
                return repackResponse(BusinessTypeService.list({ per_page: 9999 }));
            }]
        }
    });

    $stateProvider.state({
        name: "organization-funds",
        url: "/organizations/{organization_id}/funds?funds_type",
        component: "organizationFundsComponent",
        params: {
            funds_type: {
                squash: true,
                value: null
            },
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('organization-funds', ['manage_funds', 'view_finances', 'view_funds'], false),
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id, { with_archived: 1, with_external: 1, stats: 'min' }))
            }],
            recordTypes: ['RecordTypeService', 'permission', (RecordTypeService) => {
                return repackResponse(RecordTypeService.list());
            }],
            validatorOrganizations: ['$transition$', 'OrganizationService', 'permission', ($transition$, OrganizationService) => {
                return repackPagination(OrganizationService.readListValidators($transition$.params().organization_id, { per_page: 100 }));
            }],
        }
    });

    $stateProvider.state({
        name: "external-validators",
        url: "/organizations/{organization_id}/external-validators",
        component: "externalValidatorsComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            permission: permissionMiddleware('organization-providers', 'manage_organization'),
            organization: organizationResolver(),
            validatorOrganizations: ['permission', '$transition$', 'OrganizationService', (
                permission, $transition$, OrganizationService
            ) => repackPagination(OrganizationService.listValidatorsAvailable())],
            validatorOrganizationsApproved: ['permission', '$transition$', 'OrganizationService', (
                permission, $transition$, OrganizationService
            ) => repackPagination(OrganizationService.readListValidators(
                $transition$.params().organization_id, {
                per_page: 100
            }
            ))],
        }
    });

    $stateProvider.state({
        name: "external-funds",
        url: "/organizations/{organization_id}/external-funds",
        component: "externalFundsComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            permission: permissionMiddleware('organization-providers', 'manage_organization'),
            organization: organizationResolver(),
            funds: ['permission', '$transition$', 'OrganizationService', (
                permission, $transition$, OrganizationService
            ) => repackPagination(OrganizationService.listExternalFunds(
                $transition$.params().organization_id
            ))],
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "sponsor-provider-organizations",
        url: [
            "/organizations/{organization_id}/providers?",
            "{q:string}&{order_by:string}&{fund_id:int}&{allow_budget:string}&",
            "{allow_products:string}&{has_products:string}",
        ].join(''),
        params: {
            q: routeParam(''),
            order_by: routeParam('application_date'),
            fund_id: routeParam(null),
            allow_budget: routeParam(''),
            allow_products: routeParam(''),
            has_products: routeParam(''),
        },
        component: "sponsorProviderOrganizationsComponent",
        resolve: {
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            organization: organizationResolver(),
            funds: ['$transition$', 'FundService', 'permission', (
                $transition$, FundService,
            ) => repackResponse(FundService.list($transition$.params().organization_id, {
                per_page: 100
            }))],
            fundUnsubscribes: ['$transition$', 'FundUnsubscribeService', 'permission', (
                $transition$, FundUnsubscribeService,
            ) => repackResponse(FundUnsubscribeService.listSponsor($transition$.params().organization_id, {
                per_page: 1000
            }))],
            providerOrganizations: ['$transition$', 'OrganizationService', (
                $transition$, OrganizationService,
            ) => repackPagination(OrganizationService.providerOrganizations($transition$.params().organization_id, {
                ...pick($transition$.params(), [
                    'q', 'fund_id', 'allow_budget', 'allow_products', 'has_products',
                ]),
            }))],
        }
    });

    // Fund unsubscribe requests (sponsor)
    $stateProvider.state({
        name: "sponsor-fund-unsubscriptions",
        url: "/organizations/{organization_id}/fund-unsubscriptions?state",
        component: "sponsorFundUnsubscriptionsComponent",
        params: {
            state: routeParam('all'),
        },
        resolve: {
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            organization: organizationResolver(),
        }
    });

    // Organization provider
    $stateProvider.state({
        name: "sponsor-provider-organization",
        url: "/organizations/{organization_id}/provider/{provider_organization_id}",
        component: "sponsorProviderOrganizationComponent",
        resolve: {
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            organization: organizationResolver(),
            providerOrganization: ['permission', 'OrganizationService', '$transition$', (
                permission, OrganizationService, $transition$
            ) => permission ? repackResponse(OrganizationService.providerOrganization(
                $transition$.params().organization_id,
                $transition$.params().provider_organization_id,
            )) : permission],
        }
    });

    // Organization provider product create
    $stateProvider.state({
        name: "fund-provider-product-create",
        url: "/organizations/{organization_id}/funds/{fund_id}/providers/{fund_provider_id}/products/create?source=",
        component: "productsEditComponent",
        resolve: {
            source: () => 'sponsor',
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            organization: organizationResolver(),
            sourceProduct: ['$transition$', 'FundService', 'permission', (
                $transition$, FundService
            ) => $transition$.params().source ? repackResponse(FundService.getProviderProduct(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id,
                $transition$.params().source
            )) : new Promise((res) => res(null))],
            fundProvider: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(FundService.readProvider(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id
            )) : new Promise((res) => res(null))],
            providerOrganization: ['permission', 'OrganizationService', '$transition$', 'fundProvider', (
                permission, OrganizationService, $transition$, fundProvider
            ) => permission ? repackResponse(OrganizationService.providerOrganization(
                $transition$.params().organization_id,
                fundProvider.organization_id,
            )) : permission],
        }
    });

    // Organization provider
    $stateProvider.state({
        name: "fund-provider-product-edit",
        url: "/organizations/{organization_id}/funds/{fund_id}/providers/{fund_provider_id}/products/{product_id}/edit",
        component: "productsEditComponent",
        resolve: {
            source: () => 'sponsor',
            organization: organizationResolver(),
            permission: permissionMiddleware('organization-providers', 'manage_providers'),
            fundProvider: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(FundService.readProvider(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id
            )) : new Promise((res) => res(null))],
            providerOrganization: ['permission', 'OrganizationService', '$transition$', 'fundProvider', (
                permission, OrganizationService, $transition$, fundProvider
            ) => permission ? repackResponse(OrganizationService.providerOrganization(
                $transition$.params().organization_id,
                fundProvider.organization_id,
            )) : permission],
            product: ['$transition$', 'FundService', 'permission', (
                $transition$, FundService
            ) => $transition$.params().product_id ? repackResponse(FundService.getProviderProduct(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id,
                $transition$.params().product_id
            )) : new Promise((res) => res(null))],
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
            organization: organizationResolver(),
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

    // Organization providers
    $stateProvider.state({
        name: "fund-provider-product",
        url: "/organizations/{organization_id}/funds/{fund_id}/providers/{fund_provider_id}/products/{product_id}",
        component: "fundProviderProductComponent",
        params: {
            organization_id: null,
            fund_id: null,
            fund_provider_id: null,
            product_id: null,
        },
        resolve: {
            organization: organizationResolver(),
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
            ) : new Promise((res) => res(null))],
            product: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(
                FundService.getProviderProduct(
                    $transition$.params().organization_id,
                    $transition$.params().fund_id,
                    $transition$.params().fund_provider_id,
                    $transition$.params().product_id
                )
            ) : new Promise((res) => res(null))],
            fundProviderProductChats: ['permission', '$transition$', 'FundProviderChatService', (
                permission, $transition$, FundProviderChatService
            ) => $transition$.params().fund_id != null ? repackResponse(FundProviderChatService.list(
                $transition$.params().organization_id,
                $transition$.params().fund_id,
                $transition$.params().fund_provider_id, {
                product_id: $transition$.params().product_id
            }
            )) : new Promise((res) => res(null))],
        }
    });

    // Organization providers
    $stateProvider.state({
        name: "fund-provider-product-subsidy-edit",
        url: "/organizations/{organization_id}/funds/{fund_id}/providers/{fund_provider_id}/products/{product_id}/subsidy?deal_id",
        component: "fundProviderProductSubsidyEditComponent",
        params: {
            organization_id: null,
            fund_id: null,
            fund_provider_id: null,
            product_id: null,
        },
        resolve: {
            organization: organizationResolver(),
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
            ) : new Promise((res) => res(null))],
            product: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => $transition$.params().fund_id != null ? repackResponse(
                FundService.getProviderProduct(
                    $transition$.params().organization_id,
                    $transition$.params().fund_id,
                    $transition$.params().fund_provider_id,
                    $transition$.params().product_id
                )
            ) : new Promise((res) => res(null))],
        }
    });

    // Organization employees
    $stateProvider.state({
        name: "employees",
        url: "/organizations/{organization_id}/employees",
        component: "organizationEmployeesComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('employees-list', 'manage_employees'),
            employees: ['$transition$', 'OrganizationEmployeesService', 'permission', ($transition$, OrganizationEmployeesService) => {
                return repackPagination(OrganizationEmployeesService.list($transition$.params().organization_id, { per_page: 15 }));
            }],
            roles: ['RoleService', 'permission', (RoleService) => {
                return repackResponse(RoleService.list());
            }],
        }
    });

    // Organization employees
    $stateProvider.state({
        name: "bank-connections",
        url: "/organizations/{organization_id}/bank-connections?{success:bool}&{error:string}",
        component: "organizationBankConnectionsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('bank-connections', 'manage_bank_connections'),
            banks: ['BanksService', 'permission', (BanksService) => {
                return repackPagination(BanksService.list());
            }],
            bankConnections: ['$transition$', 'BankConnectionService', 'permission', ($transition$, BankConnectionService) => {
                return repackPagination(BankConnectionService.list($transition$.params().organization_id, { per_page: 20 }));
            }]
        }
    });

    // Organization employees
    $stateProvider.state({
        name: "notifications",
        url: "/organizations/{organization_id}/notifications",
        component: "organizationNotificationsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('employees-list', 'manage_employees'),
        }
    });

    $stateProvider.state({
        name: "financial-dashboard",
        url: "/organizations/{organization_id}/financial-dashboard",
        component: "financialDashboardComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('financial-dashboard', 'view_finances'),
            options: ['permission', 'organization', 'FundService', (permission, organization, FundService) => {
                return permission ? FundService.readFinances(organization.id, {
                    filters: 1,
                }).then(res => res.data.filters) : null;
            }],
        }
    });

    $stateProvider.state({
        name: "financial-dashboard-overview",
        url: "/organizations/{organization_id}/financial-dashboard/overview",
        component: "financialDashboardOverviewComponent",
        resolve: {
            permission: permissionMiddleware('financial-dashboard', 'view_finances'),
            organization: organizationResolver(),
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => permission ? repackPagination(FundService.list($transition$.params().organization_id, {
                stats: 'all',
            })) : null],
            fundsFinancialOverview: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => permission ? repackPagination(FundService.financialOverview(
                $transition$.params().organization_id
            )) : permission],
        }
    });

    /**
     * Offices
     */
    $stateProvider.state({
        name: "offices",
        url: "/organizations/{organization_id}/offices",
        component: "officesComponent",
        resolve: {
            organization: organizationResolver(),
            offices: ['organization', '$transition$', 'PermissionsService', 'OfficeService', (
                organization, $transition$, PermissionsService, OfficeService
            ) => {
                if (!PermissionsService.hasPermission(organization, 'manage_offices')) {
                    return false;
                }

                return repackResponse(OfficeService.list(
                    $transition$.params().organization_id, {
                    per_page: 100
                }));
            }]
        }
    });

    $stateProvider.state({
        name: "offices-create",
        url: "/organization/{organization_id}/offices/create",
        component: "officesEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('offices-create', 'manage_offices'),
        }
    });

    $stateProvider.state({
        name: "offices-edit",
        url: "/organization/{organization_id}/offices/{id}/edit",
        component: "officesEditComponent",
        resolve: {
            organization: organizationResolver(),
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
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-create', 'manage_funds'),
            validators: ['$transition$', 'OrganizationEmployeesService', 'permission', ($transition$, OrganizationEmployeesService) => {
                return repackResponse(OrganizationEmployeesService.list($transition$.params().organization_id, {
                    role: 'validation',
                }));
            }],
            productCategories: ['ProductCategoryService', 'permission', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.listAll());
            }],
            fundStates: ['FundService', 'permission', (FundService) => {
                return FundService.states();
            }],
            recordTypes: ['RecordTypeService', 'permission', (RecordTypeService) => {
                return repackResponse(RecordTypeService.list());
            }],
            validatorOrganizations: ['$transition$', 'OrganizationService', 'permission', ($transition$, OrganizationService) => {
                return repackPagination(OrganizationService.readListValidators($transition$.params().organization_id, {
                    per_page: 100,
                }));
            }],
            products: ['ProductService', 'permission', (ProductService) => {
                return repackResponse(ProductService.listAll({ per_page: 1000, unlimited_stock: 1, simplified: 1 }));
            }],
        }
    });

    $stateProvider.state({
        name: "funds-show",
        url: "/organizations/{organization_id}/funds/{id}",
        component: "fundsShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-show', ['view_funds', 'manage_funds', 'view_finances'], false),
            fund: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.read($transition$.params().organization_id, $transition$.params().id));
            }],
        }
    });

    $stateProvider.state({
        name: "funds-security",
        url: "/organizations/{organization_id}/funds/{id}/security",
        component: "fundsSecurityComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-show', ['view_funds', 'manage_funds', 'view_finances'], false),
            fund: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.read($transition$.params().organization_id, $transition$.params().id));
            }],
        }
    });

    $stateProvider.state({
        name: "funds-edit",
        url: "/organizations/{organization_id}/funds/{id}/edit",
        component: "fundsEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-edit', ['manage_funds', 'manage_fund_texts'], false),
            fund: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.read($transition$.params().organization_id, $transition$.params().id));
            }],
            tags: ['TagService', 'permission', (TagService) => {
                return repackResponse(TagService.list({ scope: 'webshop', per_page: 1000 }));
            }],
            fundStates: ['FundService', 'permission', (FundService) => {
                return FundService.states();
            }],
            recordTypes: ['RecordTypeService', 'permission', (RecordTypeService) => {
                return repackResponse(RecordTypeService.list());
            }],
            productCategories: ['ProductCategoryService', 'permission', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.listAll());
            }],
            validators: ['$transition$', 'OrganizationEmployeesService', 'permission', ($transition$, OrganizationEmployeesService) => {
                return repackResponse(OrganizationEmployeesService.list(
                    $transition$.params().organization_id, { role: 'validation' }
                ));
            }],
            validatorOrganizations: ['$transition$', 'OrganizationService', 'permission', ($transition$, OrganizationService) => {
                return repackPagination(OrganizationService.readListValidators(
                    $transition$.params().organization_id, { per_page: 100 }
                ));
            }],
            products: ['ProductService', 'permission', (ProductService) => {
                return repackResponse(ProductService.listAll({ per_page: 1000, unlimited_stock: 1, simplified: 1 }));
            }],
        }
    });

    $stateProvider.state({
        name: "identities-show",
        url: "/organizations/{organization_id}/funds/{fund_id}/identities/{id}",
        component: "identitiesShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-show', ['manage_funds', 'view_finances'], false),
            fund: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.read($transition$.params().organization_id, $transition$.params().fund_id));
            }],
            identity: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.readIdentity(
                    $transition$.params().organization_id, $transition$.params().fund_id, $transition$.params().id
                ));
            }],
        }
    });

    $stateProvider.state({
        name: "fund-backoffice-edit",
        url: "/organizations/{organization_id}/funds/{id}/backoffice",
        component: "fundBackofficeEdit",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('funds-edit', 'manage_funds'),
            fund: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.read($transition$.params().organization_id, $transition$.params().id));
            }],
        }
    });

    if (!appConfigs.hide_voucher_generators) {
        /**
         * Vouchers
         */
        $stateProvider.state({
            name: "vouchers",
            url: [
                "/organizations/{organization_id}/vouchers?",
                "{fund_id:int}&{q:string}&{granted:int}&{amount_min:int}&{amount_max:int}&{date_type:string}&",
                "{from:string}&{to:string}&{in_use:int}&{count_per_identity_min:int}&{count_per_identity_max:int}&",
                "{type:string}&{source:string}&{sort_by:string}&{sort_order:string}&{state:string}&{page:int}",
            ].join(''),
            params: {
                q: routeParam(''),
                fund_id: routeParam(null),
                granted: routeParam(),
                amount_min: routeParam(),
                amount_max: routeParam(),
                date_type: routeParam('created_at'),
                from: routeParam(),
                to: routeParam(),
                state: routeParam(),
                in_use: routeParam(),
                count_per_identity_min: routeParam(0),
                count_per_identity_max: routeParam(),
                page: routeParam(1),
                type: routeParam('fund_voucher'),
                source: routeParam('all'),
                sort_by: routeParam('created_at'),
                sort_order: routeParam('desc'),
            },
            component: "vouchersComponent",
            resolve: {
                organization: organizationResolver(),
                permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
                fund: ['funds', '$transition$', (funds, $transition$) => {
                    return $transition$.params().fund_id ? funds.filter(fund => fund.id == $transition$.params().fund_id)[0] || false : null;
                }],
                funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                    return repackResponse(FundService.list($transition$.params().organization_id, { per_page: 100, configured: 1 }));
                }],
            }
        });

        /**
         * Voucher details
         */
        $stateProvider.state({
            name: "vouchers-show",
            url: "/organizations/{organization_id}/vouchers/{voucher_id}",
            component: "vouchersShowComponent",
            resolve: {
                organization: organizationResolver(),
                permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
                voucher: ['$transition$', 'VoucherService', 'permission', ($transition$, VoucherService) => repackResponse(VoucherService.show(
                    $transition$.params().organization_id,
                    $transition$.params().voucher_id,
                ))],
                fund: ['FundService', 'voucher', (FundService, voucher) => repackResponse(FundService.read(
                    voucher.fund.organization_id,
                    voucher.fund.id,
                ))],
            }
        });

        /**
         * Vouchers
         */
        $stateProvider.state({
            name: "product-vouchers",
            url: [
                "/organizations/{organization_id}/product-vouchers?",
                "{fund_id:int}&{q:string}&{granted:int}&{amount_min:int}&{amount_max:int}&{date_type:string}&",
                "{from:string}&{to:string}&{in_use:int}&{count_per_identity_min:int}&{count_per_identity_max:int}&",
                "{type:string}&{source:string}&{sort_by:string}&{sort_order:string}&{state:string}&{page:int}",
            ].join(''),
            params: {
                q: routeParam(''),
                fund_id: routeParam(null),
                granted: routeParam(),
                amount_min: routeParam(),
                amount_max: routeParam(),
                date_type: routeParam('created_at'),
                from: routeParam(),
                to: routeParam(),
                state: routeParam(),
                in_use: routeParam(),
                count_per_identity_min: routeParam(0),
                count_per_identity_max: routeParam(),
                page: routeParam(1),
                type: routeParam('product_voucher'),
                source: routeParam('all'),
                sort_by: routeParam('created_at'),
                sort_order: routeParam('desc'),
            },
            component: "productVouchersComponent",
            resolve: {
                organization: organizationResolver(),
                permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
                funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                    return repackResponse(FundService.list($transition$.params().organization_id, { per_page: 100, configured: 1 }));
                }],
                fund: [
                    'funds', '$transition$',
                    function (funds, $transition$) {
                        // $state.params.token
                        let fund_id = $transition$.params().fund_id;

                        return $transition$.params(), fund_id ? funds.filter(
                            fund => fund.id == $transition$.params().fund_id
                        )[0] || false : null;
                    }
                ],
                vouchers: ['$transition$', 'VoucherService', ($transition$, VoucherService) => {
                    return repackPagination(VoucherService.index($transition$.params().organization_id, {
                    ...pick($transition$.params(), [
                        'q', 'granted', 'amount_min', 'amount_max', 'date_type', 'from', 'to',
                        'state', 'in_use', 'count_per_identity_min', 'count_per_identity_max',
                        'type', 'source', 'sort_by', 'sort_order', 'fund_id', 'page',
                    ]), per_page: 20 }))
                }],
            }
        });
    }

    /**
     * Reimbursements
     */
    $stateProvider.state({
        name: "reimbursements",
        url: "/organizations/{organization_id}/reimbursements?fund_id",
        component: "reimbursementsComponent",
        params: {
            fund_id: null,
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id, { per_page: 100, configured: 1 }));
            }],
            fund: ['funds', '$transition$', 'FundService', (funds, $transition$, FundService) => {
                if ($transition$.params().fund_id) {
                    return funds.find((fund) => fund.id == $transition$.params().fund_id) || funds[0] || null;
                }

                return FundService.getLastSelectedFund(funds) || funds[0];
            }],
        }
    });

    /**
     * Reimbursement categories
     */
    $stateProvider.state({
        name: "reimbursement-categories-edit",
        url: "/organizations/{organization_id}/reimbursement-categories-edit",
        component: "reimbursementCategoriesEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('vouchers-list', 'manage_vouchers'),
        }
    });

    /**
     * Voucher details
     */
    $stateProvider.state({
        name: "reimbursements-show",
        url: "/organizations/{organization_id}/reimbursements/{id}",
        component: "reimbursementsShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('reimbursements-list', 'manage_reimbursements'),
            reimbursement: ['$transition$', 'ReimbursementService', 'permission', ($transition$, ReimbursementService) => {
                return repackResponse(ReimbursementService.show($transition$.params().organization_id, $transition$.params().id));
            }],
        }
    });

    /**
     * Implementations
     */
    $stateProvider.state({
        name: "implementations",
        url: "/organizations/{organization_id}/implementations",
        component: "implementationsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', [
                'manage_implementation', 'manage_implementation_cms'
            ], false),
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(FundService.list(
                $transition$.params().organization_id
            ))],
            implementations: ['permission', '$transition$', 'ImplementationService', (
                permission, $transition$, ImplementationService
            ) => repackPagination(ImplementationService.list(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
        }
    });


    /**
     * Implementations
     */
    $stateProvider.state({
        name: "implementation-notifications",
        url: "/organizations/{organization_id}/implementation-notifications",
        component: "implementationNotificationsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation_cms'], false),
            implementations: ['permission', '$transition$', 'ImplementationService', (
                permission, $transition$, ImplementationService
            ) => repackPagination(ImplementationService.list(
                $transition$.params().organization_id
            ))],
        }
    });

    /**
     * Implementations
     */
    $stateProvider.state({
        name: "implementation-notifications-show",
        url: "/organizations/{organization_id}/implementations/{implementation_id}/implementation-notifications/{id}",
        component: "implementationNotificationsShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation_cms'], false),
            funds: ['$transition$', 'FundService', 'implementation', 'permission', ($transition$, FundService, implementation) => {
                return implementation.allow_per_fund_notification_templates ? repackResponse(FundService.list(
                    $transition$.params().organization_id,
                    { implementation_id: implementation?.id, with_archived: 1, stats: 'min' },
                )) : null;
            }],
            implementation: ['$transition$', 'ImplementationService', 'permission', (
                $transition$, ImplementationService
            ) => repackResponse(ImplementationService.read(
                $transition$.params().organization_id,
                $transition$.params().implementation_id
            ))],
            notification: ['ImplementationNotificationsService', '$transition$', 'permission', (
                ImplementationNotificationsService, $transition$
            ) => repackResponse(ImplementationNotificationsService.show(
                $transition$.params().organization_id,
                $transition$.params().implementation_id,
                $transition$.params().id
            ))],
        }
    });

    /**
     * Implementations
     */
    $stateProvider.state({
        name: "implementation-notifications-send",
        url: "/organizations/{organization_id}/implementations/{implementation_id}/implementation-notifications/send",
        component: "implementationNotificationsSendComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation_cms'], false),
            implementation: ['permission', '$transition$', 'ImplementationService', (
                permission, $transition$, ImplementationService
            ) => repackResponse(ImplementationService.read(
                $transition$.params().organization_id,
                $transition$.params().implementation_id
            ))],
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id, {
                    implementation_id: $transition$.params().id,
                    state: 'active',
                }))
            }],
        }
    });

    /**
     * Notifications branding
     */
    $stateProvider.state({
        name: "implementation-notifications-branding",
        url: "/organizations/{organization_id}/implementations/{implementation_id}/notifications-branding",
        component: "implementationNotificationsBrandingComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation_cms'], false),
            implementation: ['permission', '$transition$', 'ImplementationService', (
                permission, $transition$, ImplementationService
            ) => repackResponse(ImplementationService.read(
                $transition$.params().organization_id,
                $transition$.params().implementation_id
            ))],
        }
    });

    /**
     * Implementation view
     */
    $stateProvider.state({
        name: "implementation-view",
        url: "/organizations/{organization_id}/implementation/{id}",
        component: "implementationViewComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', [
                'manage_implementation', 'manage_implementation_cms'
            ], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().id,
                ), (res) => {
                    res.status === 403 && $timeout(() => {
                        $state.go('implementations', {
                            organization_id: $transition$.params().organization_id
                        });
                    }, 100);
                });
            }],
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id, {
                    implementation_id: $transition$.params().id
                }))
            }],
        }
    });

    /**
     * Implementation edit (CMS)
     */
    $stateProvider.state({
        name: "implementation-cms",
        url: "/organizations/{organization_id}/implementation/{id}/cms",
        component: "implementationCmsEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation', 'manage_implementation_cms'], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => $state.go('implementations', { organization_id: $transition$.params().organization_id }), 100);
                    }
                });
            }],
            pages: ['$transition$', '$timeout', '$state', 'ImplementationPageService', 'permission', (
                $transition$, $timeout, $state, ImplementationPageService
            ) => {
                return repackResponse(ImplementationPageService.list(
                    $transition$.params().organization_id,
                    $transition$.params().id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => $state.go('implementations', { organization_id: $transition$.params().organization_id }), 100);
                    }
                });
            }],
        }
    });

    /**
     * Implementation edit page(CMS)
     */
    $stateProvider.state({
        name: "implementation-cms-page",
        url: "/organizations/{organization_id}/implementation/{implementation_id}/pages/{id}",
        component: "implementationCmsPageEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation', 'manage_implementation_cms'], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().implementation_id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => $state.go('implementations', $transition$.params()), 100);
                    }
                });
            }],
            page: ['$transition$', '$timeout', '$state', 'ImplementationPageService', 'permission', (
                $transition$, $timeout, $state, ImplementationPageService
            ) => {
                return repackResponse(ImplementationPageService.read(
                    $transition$.params().organization_id,
                    $transition$.params().implementation_id,
                    $transition$.params().id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => {
                            $state.go('implementation-cms', {
                                organization_id: $transition$.params().organization_id,
                                id: $transition$.params().implementation_id,
                            });
                        }, 100);
                    }
                });
            }],
        }
    });

    /**
     * Implementation edit (CMS)
     */
    $stateProvider.state({
        name: "implementation-config",
        url: "/organizations/{organization_id}/implementation/{implementation_id}/config",
        component: "implementationCmsConfigEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation', 'manage_implementation_cms'], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().implementation_id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => {
                            $state.go('implementation-cms', {
                                organization_id: $transition$.params().organization_id,
                                id: $transition$.params().implementation_id,
                            });
                        }, 100);
                    }
                });
            }],
        }
    });

    /**
     * Implementation edit social media (CMS)
     */
     $stateProvider.state({
        name: "implementation-social-media",
        url: "/organizations/{organization_id}/implementation/{implementation_id}/social-media",
        component: "implementationCmsSocialMediaEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation', 'manage_implementation_cms'], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().implementation_id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => {
                            $state.go('implementation-cms', {
                                organization_id: $transition$.params().organization_id,
                                id: $transition$.params().implementation_id,
                            });
                        }, 100);
                    }
                });
            }],
        }
    });

    /**
     * Implementation create page
     */
    $stateProvider.state({
        name: "implementation-cms-page-create",
        url: "/organizations/{organization_id}/implementation/{implementation_id}/pages/create?type",
        component: "implementationCmsPageEditComponent",
        params: {
            type: { dynamic: true, value: null },
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', ['manage_implementation', 'manage_implementation_cms'], false),
            implementation: ['$transition$', '$timeout', '$state', 'ImplementationService', 'permission', (
                $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().implementation_id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => $state.go('implementations', $transition$.params()), 100);
                    }
                });
            }],
        }
    });

    /**
     * Implementation edit (email)
     */
    $stateProvider.state({
        name: "implementation-email",
        url: "/organizations/{organization_id}/implementation/{id}/email",
        component: "implementationEmailEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', 'manage_implementation'),
            implementation: ['permission', '$transition$', '$timeout', '$state', 'ImplementationService', (
                permission, $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => {
                            $state.go('implementations', {
                                organization_id: $transition$.params().organization_id
                            });
                        }, 100);
                    }
                });
            }],
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(FundService.list(
                $transition$.params().organization_id, {
                implementation_id: $transition$.params().id
            }
            ))]
        }
    });

    /**
     * Implementation edit (DigiD)
     */
    $stateProvider.state({
        name: "implementation-digid",
        url: "/organizations/{organization_id}/implementation/{id}/digid",
        component: "implementationDigidEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('implementation-manage', 'manage_implementation'),
            implementation: ['permission', '$transition$', '$timeout', '$state', 'ImplementationService', (
                permission, $transition$, $timeout, $state, ImplementationService
            ) => {
                return repackResponse(ImplementationService.read(
                    $transition$.params().organization_id,
                    $transition$.params().id,
                ), (res) => {
                    if (res.status === 403) {
                        $timeout(() => {
                            $state.go('implementations', {
                                organization_id: $transition$.params().organization_id
                            });
                        }, 100);
                    }
                });
            }],
            funds: ['permission', '$transition$', 'FundService', (
                permission, $transition$, FundService
            ) => repackResponse(FundService.list(
                $transition$.params().organization_id, {
                implementation_id: $transition$.params().id
            }
            ))]
        }
    });

    /**
     * Transactions
     */
    $stateProvider.state({
        name: "transactions",
        url: [
            "/organizations/{organization_id}/transactions?",
            "{type:string}&{q:string}&{page:int}&{state:string}&{fund_id:int}&{fund_state:string}&",
            "{from:string}&{to:string}&{amount_min:int}&{amount_max:int}&{quantity_min:int}&",
            "{quantity_max:int}&{order_by:string}&{order_dir:string}",
        ].join(''),
        params: {
            q: routeParam(""),
            to: routeParam(),
            from: routeParam(),
            type: routeParam("transactions"),
            page: routeParam(1),
            state: routeParam(),
            fund_id: routeParam(),
            fund_state: routeParam(),
            amount_min: routeParam(),
            amount_max: routeParam(),
            quantity_min: routeParam(),
            quantity_max: routeParam(),
            order_by: routeParam('created_at'),
            order_dir: routeParam('desc'),
        },
        component: "transactionsComponent",
        resolve: {
            funds: ['$transition$', 'FundService', 'ProviderFundService', 'appConfigs', 'permission', (
                $transition$, FundService, ProviderFundService, appConfigs
            ) => {
                if (appConfigs.panel_type === 'provider') {
                    return repackResponse(ProviderFundService.listFunds($transition$.params().organization_id)).then((data) => {
                        return data.map((item) => item.fund);
                    });
                }

                return repackResponse(FundService.list($transition$.params().organization_id));
            }],
            transactions: ['$transition$', 'TransactionService', 'appConfigs', (
                $transition$, TransactionService, appConfigs
            ) => repackPagination(TransactionService.list(appConfigs.panel_type, $transition$.params().organization_id, {
                ...pick($transition$.params(), $transition$.params().type == 'transactions' ? [
                    'q', 'page', 'state', 'fund_id', 'fund_state', 'from', 'to', 
                    'amount_min', 'amount_max', 'quantity_min', 'quantity_max', 
                    'order_by', 'order_by_dir',
                ] : []),
                per_page: 20,
            }))],
            transactionBulks: ['$transition$', 'TransactionBulkService', (
                $transition$, TransactionBulkService
            ) => repackPagination(TransactionBulkService.list($transition$.params().organization_id, {
                ...pick($transition$.params(), $transition$.params().type == 'bulks' ? [
                    'page', 'state', 'from', 'to', 'amount_min', 'amount_max', 
                    'quantity_min', 'quantity_max', 'order_by', 'order_by_dir'
                ] : []),
                per_page: 20,
            }))],
            organization: organizationResolver(),
            permission: permissionMiddleware('transactions-list', 'view_finances')
        }
    });

    $stateProvider.state({
        name: "transaction",
        url: "/organizations/{organization_id}/transactions/{address}",
        component: "transactionComponent",
        params: { fund_id: null },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('transactions-show', 'view_finances'),
            transaction: ['$transition$', 'TransactionService', 'appConfigs', (
                $transition$, TransactionService, appConfigs
            ) => repackResponse(TransactionService.show(
                appConfigs.panel_type,
                $transition$.params().organization_id,
                $transition$.params().address
            ))]
        }
    });

    $stateProvider.state({
        name: "transaction-bulk",
        url: "/organizations/{organization_id}/transaction-bulks/{id}?{success:bool}&{error:string}",
        component: "transactionBulkComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('transactions-show', 'view_finances'),
            transactionBulk: ['$transition$', 'TransactionBulkService', 'permission', ($transition$, TransactionBulkService) => {
                return repackResponse(TransactionBulkService.show($transition$.params().organization_id, $transition$.params().id));
            }],
        }
    });

    $stateProvider.state({
        name: "products",
        url: "/organizations/{organization_id}/products?q&source",
        params: {
            q: routeParam(''),
            per_page: routeParam(10),
            source: routeParam('provider'),
        },
        component: "productsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('products-list', 'manage_products'),
            products: ['$transition$', 'ProductService', ($transition$, ProductService) => {
                return repackPagination(ProductService.list($transition$.params().organization_id, pick($transition$.params(), [
                    'q', 'source', 'per_page',
                ])));
            }],
        }
    });

    $stateProvider.state({
        name: "reservations",
        url: "/organizations/{organization_id}/reservations?reservations_type",
        component: "reservationsComponent",
        params: {
            reservations_type: {
                squash: true,
                value: null
            },
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('reservations-list', 'scan_vouchers'),
            funds: ['$transition$', 'ProviderFundService', ($transition$, ProviderFundService) => {
                return repackResponse(ProviderFundService.listFunds($transition$.params().organization_id, { per_page: 100 }))
            }],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.list($transition$.params().organization_id, {
                per_page: 100,
            }))],
            activeReservations: ['$transition$', 'ProductReservationService', (
                $transition$, ProductReservationService
            ) => repackPagination(ProductReservationService.list($transition$.params().organization_id, {
                archived: 0,
            }))],
            archivedReservations: ['$transition$', 'ProductReservationService', (
                $transition$, ProductReservationService
            ) => repackPagination(ProductReservationService.list($transition$.params().organization_id, {
                archived: 1,
            }))]
        }
    });

    $stateProvider.state({
        name: "reservations-show",
        url: "/organizations/{organization_id}/reservations/{id}",
        component: "reservationShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('reservations-show', 'scan_vouchers'),
            reservation: ['$transition$', 'ProductReservationService', (
                $transition$, ProductReservationService
            ) => repackResponse(ProductReservationService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
        }
    });

    $stateProvider.state({
        name: "reservations-settings",
        url: "/organizations/{organization_id}/reservations-settings",
        component: "reservationsSettingsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('reservations-show', 'manage_organization'),
        }
    });

    $stateProvider.state({
        name: "products-create",
        url: "/organizations/{organization_id}/products/create",
        component: "productsEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('products-create', 'manage_products'),
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.list(
                $transition$.params().organization_id
            ))],
        }
    });

    $stateProvider.state({
        name: "products-edit",
        url: "/organizations/{organization_id}/products/{id}/edit",
        component: "productsEditComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('products-edit', 'manage_products'),
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
        }
    });

    $stateProvider.state({
        name: "products-show",
        url: "/organizations/{organization_id}/products/{id}",
        component: "productsShowComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('products-show', 'manage_products'),
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
            funds: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.listProductFunds(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
            chats: ['$transition$', 'ProductChatService', (
                $transition$, ProductChatService
            ) => repackPagination(ProductChatService.list(
                $transition$.params().organization_id,
                $transition$.params().id, {
                per_page: 100
            }
            ))],
        }
    });

    $stateProvider.state({
        name: "provider-funds",
        url: "/organizations/{organization_id}/provider/funds?tab&page",
        component: "providerFundsComponent",
        params: {
            tab: routeParam(),
            page: routeParam(),
        },
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('provider-funds-list', 'manage_provider_funds'),
            fundsAvailable: ['$transition$', 'ProviderFundService', (
                $transition$, ProviderFundService
            ) => repackPagination(ProviderFundService.listAvailableFunds($transition$.params().organization_id, {
                per_page: 1
            }))],
            tab: ['$transition$', 'fundsAvailable', ($transition$, fundsAvailable) => {
                if ($transition$.params().tab) {
                    return $transition$.params().tab;
                }

                return $transition$.params().organization_id || fundsAvailable.meta.totals.active ? 'active' : 'available';
            }],
        }
    });

    // Event logs
    $stateProvider.state({
        name: "organization-logs",
        url: "/organizations/{organization_id}/logs",
        component: "eventLogsComponent",
        resolve: {
            organization: organizationResolver(),
        }
    });

    // BI connection
    $stateProvider.state({
        name: "bi-connection",
        url: "/organizations/{organization_id}/bi-connection",
        component: "biConnectionComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('export-api-connections', 'manage_bi_connection'),
        }
    });

    // Organization contacts
    $stateProvider.state({
        name: "organizations-contacts",
        url: "/organizations/{organization_id}/contacts",
        component: "organizationContactsComponent",
        resolve: {
            organization: organizationResolver(),
            permission: permissionMiddleware('fund-requests', ['manage_organization']),
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
            ) => repackResponse(FundService.list(null, {
                state: 'active_paused_and_closed'
            }))],
            prevalidations: ['$transition$', 'PrevalidationService', function ($transition$, PrevalidationService) {
                return repackPagination(PrevalidationService.list(only($transition$.params(), 'page', 'q')));
            }],
            recordTypes: ['RecordTypeService', (RecordTypeService) => repackResponse(RecordTypeService.list())]
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
            permission: permissionMiddleware('fund-requests', ['validate_records', 'manage_validators'], false),
            organization: organizationResolver(),
            authUser: authUserResolver(),
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id));
            }],
            employees: ['$transition$', 'OrganizationEmployeesService', 'permission', ($transition$, OrganizationEmployeesService) => {
                return repackPagination(OrganizationEmployeesService.list($transition$.params().organization_id, {
                    per_page: 100,
                    permission: 'validate_records'
                }));
            }],
        }
    });

    $stateProvider.state({
        name: 'fund-requests-show',
        url: '/organizations/{organization_id}/requests/{id}',
        component: 'fundRequestsShowComponent',
        params: {
            organization_id: null,
            id: null,
        },
        resolve: {
            permission: permissionMiddleware('fund-requests', ['validate_records', 'manage_validators'], false),
            organization: organizationResolver(),
            authUser: authUserResolver(),
            funds: ['$transition$', 'FundService', 'permission', ($transition$, FundService) => {
                return repackResponse(FundService.list($transition$.params().organization_id));
            }],
            employee: ['authUser', 'employees', 'permission', (authUser, employees) => {
                return employees.data.filter((employee) => employee.identity_address == authUser.address)[0] || null;
            }],
            employees: ['$transition$', 'OrganizationEmployeesService', 'permission', ($transition$, OrganizationEmployeesService) => {
                return repackPagination(OrganizationEmployeesService.list($transition$.params().organization_id, {
                    per_page: 100,
                    permission: 'validate_records'
                }));
            }],
            validatorRequest: ['$transition$', 'FundRequestValidatorService', (
                $transition$, FundRequestValidatorService
            ) => repackResponse(FundRequestValidatorService.read(
                $transition$.params().organization_id,
                $transition$.params().id
            ))],
        }
    });

    $stateProvider.state({
        name: 'preferences-notifications',
        url: '/preferences/notifications',
        component: 'emailPreferencesComponent'
    });

    $stateProvider.state({
        name: 'identity-emails',
        url: '/preferences/emails',
        component: 'identityEmailsComponent',
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        }
    });

    $stateProvider.state({
        name: 'security-sessions',
        url: '/security/sessions',
        component: 'securitySessionsComponent',
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        },
    });

    $stateProvider.state({
        name: 'security-2fa',
        url: '/security/2fa',
        component: 'security2FAComponent',
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        },
    });

    $stateProvider.state({
        name: 'productboard',
        url: '/feedback',
        component: 'productBoardComponent',
    });

    $stateProvider.state({
        name: "restore-email",
        url: "/identity-restore?token&target",
        data: {
            token: null
        },
        controller: ['$rootScope', '$state', 'PermissionsService', 'IdentityService', 'CredentialsService', 'ModalService', 'PushNotificationsService', (
            $rootScope, $state, PermissionsService, IdentityService, CredentialsService, ModalService, PushNotificationsService
        ) => {
            let target = $state.params.target || '';

            IdentityService.authorizeAuthEmailToken($state.params.token).then(function (res) {
                CredentialsService.set(res.data.access_token);

                $rootScope.loadAuthUser().then(auth_user => {
                    let organizations = auth_user.organizations.filter(organization =>
                        !organization.business_type_id &&
                        PermissionsService.hasPermission(organization, 'manage_organization')
                    );

                    let onReady = () => {
                        if (typeof target != 'string' || !handleAuthTarget($state, target.split('-'))) {
                            return $state.go('organizations');
                        }
                    };

                    if (organizations.length > 0) {
                        ModalService.open('businessSelect', {
                            organizations: organizations,
                            onReady: () => onReady(),
                        });
                    } else {
                        onReady();
                    }
                });
            }, () => {
                PushNotificationsService.danger(
                    "Helaas, het is niet gelukt om in te loggen. ",
                    "De link is reeds gebruikt of niet meer geldig, probeer het opnieuw met een andere link.",
                    'close', { timeout: 8000 }
                );

                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: "confirmation-email",
        url: "/confirmation/email/{token}?target",
        data: {
            token: null
        },
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'PushNotificationsService', (
            $rootScope, $state, IdentityService, CredentialsService, PushNotificationsService
        ) => {
            let target = $state.params.target || '';

            IdentityService.exchangeConfirmationToken($state.params.token).then(function (res) {
                CredentialsService.set(res.data.access_token);

                $rootScope.loadAuthUser().then(() => {
                    if (typeof target != 'string' || !handleAuthTarget($state, target.split('-'))) {
                        $state.go('home', {
                            confirmed: 1
                        });
                    }
                });
            }, (res) => {
                PushNotificationsService.danger(res.data.message, "Deze link is reeds gebruikt of ongeldig.", 'close', {
                    timeout: 8000,
                });

                $state.go('home');
            });
        }]
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
            IdentityService.exchangeShortToken($state.params.token).then(res => {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => $state.go('organizations'));
            }, () => {
                PushNotificationsService.danger(res.data.message, "Deze link is reeds gebruikt of ongeldig.", 'close', {
                    timeout: 8000,
                });

                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: "sign-up",
        url: "/sign-up?fund_id&organization_id&tag&back",
        component: appConfigs.panel_type + "SignUpComponent",
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
            back: {
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

    if (['provider'].indexOf(appConfigs.panel_type) != -1) {
        $stateProvider.state({
            name: "provider-invitation-link",
            url: "/provider-invitations/{token}",
            component: 'fundProviderInviteComponent',
            data: {
                token: null
            }
        });
    }

    $stateProvider.state({
        name: "redirect",
        url: "/redirect?target",
        controller: ['$state', 'AuthService', ($state, AuthService) => {
            if (!$state.params.target || !AuthService.handleAuthTarget($state.params.target)) {
                $state.go('organizations');
            }
        }]
    });

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];