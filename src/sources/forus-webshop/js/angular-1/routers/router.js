const repackResponse = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data.data ? res.data.data : res.data), reject);
});

const resolveConfigs = () => {
    return ['ConfigService', 'appConfigs', (ConfigService, appConfigs) => {
        return appConfigs.features || repackResponse(ConfigService.get('webshop'));
    }];
}

const repackPagination = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data), reject);
});

const promiseResolve = (res) => {
    return new Promise(resolve => resolve(res));
};

const routeParam = (value = null, dynamic = true, squash = true) => {
    return {
        ...{ value },
        ...(squash !== null ? { squash } : {}),
        ...(dynamic !== null ? { dynamic } : {}),
    };
};

const i18n_state = ($stateProvider, args, defaultLocale = 'nl') => {
    const url = typeof args.url == 'string' ? { [defaultLocale]: args.url } : args.url;
    const locales = Object.keys(url).filter((locale) => locale != defaultLocale);

    $stateProvider.state({ ...args, url: url[defaultLocale] });

    locales.forEach((locale) => {
        $stateProvider.state({ ...args, name: `${args.name}-${locale}`, url: args.url[locale] });
    });
};

const resolveCmsPage = (pageSlug) => {
    return {
        configs: resolveConfigs(),
        pages: ['configs', '$q', (configs, $q) => $q((resolve) => resolve(configs.pages || null))],
        page: ['pages', '$state', '$q', (pages, $state, $q) => {
            return $q((resolve) => {
                const page = pages[pageSlug] || false;
                const { external, external_url } = page ? page : {};

                if (!page || (external && !external_url)) {
                    return $state.go('home');
                } else if (external && external_url) {
                    return document.location = external_url;
                }

                resolve(page);
            });
        }]
    };
}

module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function (
    $stateProvider, $locationProvider, appConfigs
) {
    $stateProvider.state({
        name: "home",
        url: "/?digid_error&target",
        component: "homeComponent",
        params: {
            target: null,
            digid_error: null,
            session_expired: null,
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            products: ['ProductService', (ProductService) => repackPagination(ProductService.sample('budget'))],
            subsidies: ['ProductService', (ProductService) => repackPagination(ProductService.sample('subsidies'))],
        }
    });

    $stateProvider.state({
        name: "sign-up-redirect",
        url: "/aanbieders/inloggen",
        controller: ['ConfigService', function (ConfigService) {
            ConfigService.get().then(res => document.location = res.data.fronts.url_provider)
        }]
    });

    $stateProvider.state({
        name: "sign-up",
        url: "/aanbieders/aanmelden",
        component: "signUpProviderComponent",
        resolve: resolveCmsPage('provider'),
    });

    $stateProvider.state({
        name: "sign-up-en",
        url: "/sign-up",
        controller: ['$state', function ($state) {
            $state.go('sign-up');
        }],
    });

    $stateProvider.state({
        name: "sign-up-redirect-en",
        url: "/providers/sign-in",
        controller: ['$state', function ($state) {
            $state.go('sign-up-redirect');
        }],
    });

    $stateProvider.state({
        name: "start",
        url: "/start?logout&restore_with_digid",
        component: "signUpComponent",
        params: {
            logout: null,
            restore_with_digid: null,
            restore_with_email: null,
            digid_error: null,
            email_address: null,
            redirect_scope: false,
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
        name: "privacy",
        url: "/privacy",
        component: "privacyComponent",
        resolve: resolveCmsPage('privacy'),
    });

    $stateProvider.state({
        name: "accessibility",
        url: "/accessibility",
        component: "accessibilityComponent",
        resolve: resolveCmsPage('accessibility'),
    });

    i18n_state($stateProvider, {
        name: "terms_and_conditions",
        url: {
            en: "/terms-and-conditions",
            nl: "/algemene-voorwaarden",
        },
        component: "termsAndConditionsComponent",
        resolve: resolveCmsPage('terms_and_conditions'),
    });

    $stateProvider.state({
        name: "me-app",
        url: "/me",
        component: "meComponent",
    });

    i18n_state($stateProvider, {
        name: "products",
        url: {
            en: "/products?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{bookmarked:bool}&{organization_id:int}&{distance:int}&{postcode:string}&{order_by:string}&{order_dir:string}",
            nl: "/aanbod?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{bookmarked:bool}&{organization_id:int}&{distance:int}&{postcode:string}&{order_by:string}&{order_dir:string}",
        },
        component: "productsComponent",
        params: {
            q: routeParam(""),
            page: routeParam(1),
            fund_id: routeParam(null),
            organization_id: routeParam(null),
            product_category_id: routeParam(null),
            display_type: routeParam('list'),
            bookmarked: routeParam(false),
            fund_type: routeParam('budget'),
            show_menu: routeParam(false),
            distance: routeParam(null),
            postcode: routeParam(''),
            order_by: routeParam('created_at'),
            order_dir: routeParam('desc'),
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list(null, { has_products: 1 }))],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                q: $transition$.params().q,
                page: $transition$.params().page,
                fund_id: $transition$.params().fund_id,
                fund_type: $transition$.params().fund_type,
                organization_id: $transition$.params().organization_id,
                product_category_id: $transition$.params().product_category_id,
                bookmarked: $transition$.params().bookmarked ? 1 : 0,
                order_by: $transition$.params().order_by,
                order_dir: $transition$.params().order_dir,
            }))],
            productCategory: ['ProductCategoryService', '$transition$', (ProductCategoryService, $transition$) => {
                return $transition$.params().product_category_id ?
                    repackResponse(ProductCategoryService.show($transition$.params().product_category_id)) : null;
            }],
            productCategories: ['ProductCategoryService', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.list({ 
                    parent_id: 'null', 
                    per_page: 1000, 
                    used: 1,
                    used_type: 'budget'
                }))
            }],
            productSubCategories: ['productCategory', 'ProductCategoryService', (productCategory, ProductCategoryService) => {
                return productCategory ? repackResponse(ProductCategoryService.list({
                    parent_id: productCategory.parent_id ? productCategory.parent_id : productCategory.id,
                    ...{ 
                        per_page: 1000, 
                        used: 1,
                        used_type: 'budget' 
                    },
                })) : null;
            }],
            organizations: ['OrganizationService', (OrganizationService) => OrganizationService.listRecursive({
                is_employee: 0,
                has_products: 1,
                per_page: 300,
                fund_type: 'budget'
            })],
        }
    });

    i18n_state($stateProvider, {
        name: "actions",
        url: {
            en: "/actions?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}&{order_by:string}&{order_dir:string}",
            nl: "/acties?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}&{order_by:string}&{order_dir:string}",
        },
        component: "productsComponent",
        params: {
            q: routeParam(""),
            page: routeParam(1),
            fund_id: routeParam(null),
            organization_id: routeParam(null),
            product_category_id: routeParam(null),
            display_type: routeParam('list'),
            bookmarked: routeParam(false),
            fund_type: routeParam('subsidies'),
            show_menu: routeParam(false),
            distance: routeParam(null),
            postcode: routeParam(''),
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list(null, { has_subsidies: 1 }))],
            products: ['$transition$', 'ProductService', ($transition$, ProductService) => repackPagination(ProductService.list({
                q: $transition$.params().q,
                page: $transition$.params().page,
                fund_id: $transition$.params().fund_id,
                fund_type: $transition$.params().fund_type,
                organization_id: $transition$.params().organization_id,
                product_category_id: $transition$.params().product_category_id,
                order_by: $transition$.params().order_by,
                order_dir: $transition$.params().order_dir,
            }))],
            productCategory: ['ProductCategoryService', '$transition$', (ProductCategoryService, $transition$) => {
                return $transition$.params().product_category_id ?
                    repackResponse(ProductCategoryService.show($transition$.params().product_category_id)) : null;
            }],
            productCategories: ['ProductCategoryService', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.list({ 
                    parent_id: 'null', 
                    per_page: 1000, 
                    used: 1,
                    used_type: 'subsidies'
                }))
            }],
            productSubCategories: ['productCategory', 'ProductCategoryService', (productCategory, ProductCategoryService) => {
                return productCategory ? repackResponse(ProductCategoryService.list({
                    parent_id: productCategory.parent_id ? productCategory.parent_id : productCategory.id,
                    ...{ 
                        per_page: 1000,
                        used: 1,
                        used_type: 'subsidies',
                    },
                })) : null;
            }],
            organizations: ['OrganizationService', 'HelperService', (
                OrganizationService, HelperService
            ) => HelperService.recursiveLeacher((page) => {
                return OrganizationService.list({
                    is_employee: 0,
                    has_products: 1,
                    per_page: 100,
                    page: page,
                    fund_type: 'subsidies'
                });
            }, 4)],
        }
    });

    i18n_state($stateProvider, {
        name: "product",
        url: {
            en: "/products/{id}",
            nl: "/aanbod/{id}",
        },
        component: "productComponent",
        params: { searchData: null },
        resolve: {
            vouchers: ['AuthService', 'VoucherService', '$transition$', (
                AuthService, VoucherService, $transition$
            ) => AuthService.hasCredentials() ? repackResponse(VoucherService.list({
                product_id: $transition$.params().id,
                type: 'regular',
                state: 'active',
            })) : new Promise(resolve => resolve([]))],
            product: ['$transition$', 'ProductService', ($transition$, ProductService) => {
                return repackResponse(ProductService.read($transition$.params().id));
            }],
            provider: ['product', 'ProvidersService', (product, ProvidersService) => {
                return repackResponse(ProvidersService.read(product.organization_id));
            }],
        }
    });

    i18n_state($stateProvider, {
        name: "providers",
        url: {
            en: "/providers?{page:int}&{q:string}&{fund_id:int}&{business_type_id:int}&{product_category_id:int}&{show_map:bool}&{show_menu:bool}&{distance:int}&{postcode:string}&{order_by:string}&{order_dir:string}",
            nl: "/aanbieders?{page:int}&{q:string}&{fund_id:int}&{business_type_id:int}&{product_category_id:int}&{show_map:bool}&{show_menu:bool}&{distance:int}&{postcode:string}&{order_by:string}&{order_dir:string}",
        },
        component: "providersComponent",
        params: {
            q: routeParam(''),
            page: routeParam(1),
            fund_id: routeParam(null),
            show_map: routeParam(false),
            distance: routeParam(null),
            postcode: routeParam(''),
            show_menu: routeParam(false),
            business_type_id: routeParam(null),
            product_category_id: routeParam(null),
            order_by: routeParam('name'),
            order_dir: routeParam('asc'),
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list(null, { has_providers: 1 }))],
            productCategory: ['ProductCategoryService', '$transition$', (ProductCategoryService, $transition$) => {
                return $transition$.params().product_category_id ?
                    repackResponse(ProductCategoryService.show($transition$.params().product_category_id)) : null;
            }],
            productCategories: ['ProductCategoryService', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.list({ 
                    parent_id: 'null', 
                    used: 1,
                    per_page: 1000, 
                }))
            }],
            productSubCategories: ['productCategory', 'ProductCategoryService', (productCategory, ProductCategoryService) => {
                return productCategory ? repackResponse(ProductCategoryService.list({
                    parent_id: productCategory.parent_id ? productCategory.parent_id : productCategory.id,
                    used: 1,
                    per_page: 1000, 
                })) : null;
            }],
            businessTypes: ['BusinessTypeService', (
                BusinessTypeService
            ) => repackResponse(BusinessTypeService.list({
                parent_id: 'null',
                per_page: 9999,
                used: 1,
            }))],
            providers: ['$transition$', 'ProvidersService', (
                $transition$, ProvidersService
            ) => repackPagination(ProvidersService.search({
                q: $transition$.params().q,
                page: $transition$.params().page,
                fund_id: $transition$.params().fund_id,
                distance: $transition$.params().distance,
                postcode: $transition$.params().postcode,
                business_type_id: $transition$.params().business_type_id,
                product_category_id: $transition$.params().product_category_id,
                order_by: $transition$.params().order_by,
                order_dir: $transition$.params().order_dir,
            }))]
        }
    });

    i18n_state($stateProvider, {
        name: "explanation",
        url: {
            en: "/explanation",
            nl: "/uitleg",
        },
        component: "explanationComponent",
        resolve: resolveCmsPage('explanation')
    });

    $stateProvider.state({
        name: "search-result",
        url: "/search?{q:string}&{page:int}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}&search_item_types&order_by&order_dir",
        params: {
            q: routeParam(""),
            page: routeParam(1),
            fund_id: routeParam(null),
            organization_id: routeParam(null),
            product_category_id: routeParam(null),
            display_type: routeParam('list'),
            search_item_types: routeParam('funds,providers,products'),
            fund_type: routeParam('budget'),
            order_by: routeParam('created_at'),
            order_dir: routeParam('desc'),
        },
        component: "searchResultComponent",
        resolve: {
            searchItems: ['$transition$', 'SearchService', ($transition$, SearchService) => {
                return repackPagination(SearchService.search({
                    ...{
                        q: $transition$.params().q,
                        overview: 0,
                        with_external: 1,
                        page: $transition$.params().page,
                        order_by: $transition$.params().order_by,
                        order_dir: $transition$.params().order_dir,
                        search_item_types: ($transition$.params().search_item_types || '').split(',').filter((type) => type),
                        organization_id: $transition$.params().organization_id,
                        product_category_id: $transition$.params().product_category_id
                    }
                }));
            }],
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list(null, {
                with_external: 1,
            }))],
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.list({ 
                parent_id: 'null', 
                used: 1,
                per_page: 1000,
            }))],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : promiseResolve([])],
            organizations: ['OrganizationService', 'HelperService', (
                OrganizationService, HelperService
            ) => HelperService.recursiveLeacher((page) => OrganizationService.list({
                is_employee: 0,
                has_products: 1,
                per_page: 100,
                page: page,
                fund_type: 'budget'
            }), 4)],
        }
    });

    $stateProvider.state({
        name: "provider-office",
        url: "/providers/{organization_id}/offices/{id}",
        component: "providerOfficeComponent",
        resolve: {
            provider: ['$transition$', 'ProvidersService', (
                $transition$, ProvidersService
            ) => repackResponse(ProvidersService.read(
                $transition$.params().organization_id
            ))],
            office: ['$transition$', 'OfficeService', (
                $transition$, OfficeService
            ) => repackResponse(OfficeService.read(
                $transition$.params().id
            ))],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                fund_type: 'budget',
                organization_id: $transition$.params().organization_id,
                per_page: 3,
                page: 1,
            }))],
            subsidies: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                fund_type: 'subsidies',
                organization_id: $transition$.params().organization_id,
                per_page: 3,
                page: 1,
            }))],
        }
    });

    i18n_state($stateProvider, {
        name: "provider",
        url: {
            en: "/providers/{id}",
            nl: "/aanbieders/{id}",
        },
        component: "providerComponent",
        params: { searchData: null },
        resolve: {
            provider: ['$transition$', 'ProvidersService', (
                $transition$, ProvidersService
            ) => repackResponse(ProvidersService.read(
                $transition$.params().id
            ))],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                fund_type: 'budget',
                organization_id: $transition$.params().id,
                per_page: 3,
                page: 1,
            }))],
            subsidies: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                fund_type: 'subsidies',
                organization_id: $transition$.params().id,
                per_page: 3,
                page: 1,
            }))],
        }
    });

    i18n_state($stateProvider, {
        name: "vouchers",
        url: {
            en: "/vouchers",
            nl: "/tegoeden",
        },
        component: "vouchersComponent",
        resolve: {
            vouchers: ['VoucherService', (VoucherService) => repackPagination(VoucherService.list({
                archived: 0,
                per_page: 15,
                order_by: 'voucher_type',
                order_dir: 'desc',
            }))],
            reimbursementVouchers: ['VoucherService', (VoucherService) => repackResponse(VoucherService.list({ 
                archived: 0,
                per_page: 1,
                implementation_key: appConfigs.client_key,
                allow_reimbursements: 1,
            }))],
        }
    });

    i18n_state($stateProvider, {
        name: "bookmarked-products",
        url: {
            en: "/bookmarks?{page:int}&{display_type:string}",
            nl: "/verlanglijst?{page:int}&{display_type:string}",
        },
        params: {
            display_type: {
                dynamic: true,
                value: 'list',
                squash: true
            },
        },
        component: "bookmarkedProductsComponent",
        resolve: {
            products: ['ProductService', (ProductService) => repackPagination(ProductService.list({
                bookmarked: 1
            }))],
        }
    });

    i18n_state($stateProvider, {
        name: "reservations",
        url: {
            en: "/reservations",
            nl: "/reserveringen",
        },
        component: "reservationsComponent",
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            reservations: ['ProductReservationService', (ProductReservationService) => repackPagination(ProductReservationService.list({ archived: 0 }))],
            organizations: ['OrganizationService', (OrganizationService) => OrganizationService.listRecursive({
                is_employee: 0,
                has_reservations: 1,
                per_page: 300,
                fund_type: 'budget'
            })],
        }
    });

    i18n_state($stateProvider, {
        name: "reimbursements",
        url: {
            en: "/reimbursements",
            nl: "/declaraties",
        },
        component: "reimbursementsComponent",
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            vouchers: ['VoucherService', (VoucherService) => repackResponse(VoucherService.list({
                allow_reimbursements: 1,
                implementation_key: appConfigs.client_key,
                per_page: 100,
            }))],
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        }
    });

    i18n_state($stateProvider, {
        name: "reimbursements-create",
        url: {
            en: "/reimbursements/create?voucher_address=null",
            nl: "/declaraties/maken?voucher_address=null",
        },
        params: { voucher_address: null },
        component: "reimbursementsEditComponent",
        resolve: {
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            vouchers: ['VoucherService', (VoucherService) => repackResponse(VoucherService.list({
                allow_reimbursements: 1,
                implementation_key: appConfigs.client_key,
                per_page: 100,
            }))],
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        }
    });

    i18n_state($stateProvider, {
        name: "reimbursements-edit",
        url: {
            en: "/reimbursements/{id}/edit",
            nl: "/declaraties/{id}/bewerk",
        },
        component: "reimbursementsEditComponent",
        resolve: {
            vouchers: ['VoucherService', (VoucherService) => repackResponse(VoucherService.list({
                allow_reimbursements: 1,
                implementation_key: appConfigs.client_key,
                per_page: 100,
            }))],
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            voucher: ['VoucherService', '$transition$', (VoucherService, $transition$) => {
                return $transition$.params().voucher_address ? repackResponse(VoucherService.get($transition$.params().voucher_address)) : null;
            }],
            reimbursement: ['ReimbursementService', '$transition$', (ReimbursementService, $transition$) => {
                return repackResponse(ReimbursementService.read($transition$.params().id));
            }],
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        }
    });

    i18n_state($stateProvider, {
        name: "reimbursement",
        url: {
            en: "/reimbursements/{id}",
            nl: "/declaraties/{id}",
        },
        component: "reimbursementComponent",
        resolve: {
            reimbursement: ['ReimbursementService', '$transition$', (ReimbursementService, $transition$) => {
                return repackResponse(ReimbursementService.read($transition$.params().id));
            }],
        }
    });

    i18n_state($stateProvider, {
        name: 'voucher',
        url: {
            en: '/voucher/{address}',
            nl: '/tegoeden/{address}',
        },
        component: 'voucherComponent',
        data: { address: null },
        resolve: {
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            voucher: ['$transition$', 'VoucherService', (
                $transition$, VoucherService
            ) => repackResponse(VoucherService.get(
                $transition$.params().address
            ))],
            loadProducts: ['voucher', (voucher) => !voucher.product && voucher.fund.type == 'budget'],
            loadSubsidies: ['voucher', (voucher) => voucher.fund.type == 'subsidies'],
            products: ['voucher', 'loadProducts', 'ProductService', (
                voucher, loadProducts, ProductService
            ) => loadProducts ? repackPagination(ProductService.list({
                fund_type: 'budget',
                sample: 1,
                per_page: 6,
                fund_id: voucher.fund_id,
            })) : null],
            subsidies: ['voucher', 'loadSubsidies', 'ProductService', (
                voucher, loadSubsidies, ProductService
            ) => loadSubsidies ? repackPagination(ProductService.list({
                fund_type: 'subsidies',
                sample: 1,
                per_page: 6,
                fund_id: voucher.fund_id,
            })) : null],
        }
    });

    $stateProvider.state({
        name: 'records',
        url: '/records',
        component: 'recordsComponent',
        resolve: {
            records: ['RecordService', (
                RecordService
            ) => repackResponse(RecordService.list())],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
        }
    });

    $stateProvider.state({
        name: 'record-validate',
        url: '/records/{id}/validate',
        component: 'recordValidateComponent',
        data: {
            id: null
        },
        resolve: {
            record: ['$transition$', 'RecordService', (
                $transition$, RecordService
            ) => repackResponse(RecordService.read($transition$.params().id))],
            records: ['RecordService', (
                RecordService
            ) => repackResponse(RecordService.list())],
            validators: ['ValidatorService', (
                ValidatorService
            ) => repackResponse(ValidatorService.list())],
            validationRequests: ['ValidatorRequestService', (
                ValidatorRequestService
            ) => repackResponse(ValidatorRequestService.list())],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
        }
    });

    $stateProvider.state({
        name: 'record-validations',
        url: '/records/{id}/validations',
        component: 'recordValidationsComponent',
        data: {
            id: null
        },
        resolve: {
            record: ['$transition$', 'RecordService', (
                $transition$, RecordService
            ) => repackResponse(RecordService.read($transition$.params().id))],
            records: ['RecordService', (
                RecordService
            ) => repackResponse(RecordService.list())],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
        }
    });

    $stateProvider.state({
        name: 'record-create',
        url: '/records/create',
        component: 'recordCreateComponent',
        data: {},
        resolve: {
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
        }
    });

    i18n_state($stateProvider, {
        name: "funds",
        url: {
            en: "/funds?{page:int}&{q:string}&{display_type:string}&{organization_id:int}&{tag_id:int}&{show_menu:bool}",
            nl: "/fondsen?{page:int}&{q:string}&{display_type:string}&{organization_id:int}&{tag_id:int}&{show_menu:bool}",
        },
        component: "fundsComponent",
        params: {
            q: routeParam(""),
            page: routeParam(1),
            tag_id: routeParam(null),
            show_menu: routeParam(false),
            display_type: routeParam('list'),
            organization_id: routeParam(null),
        },
        resolve: {
            credentials: ['AuthService', (AuthService) => {
                return AuthService.hasCredentials();
            }],
            tags: ['TagService', (TagService) => {
                return repackResponse(TagService.list({ type: 'funds', per_page: 1000 }));
            }],
            records: ['credentials', 'RecordService', (credentials, RecordService) => {
                return credentials ? repackResponse(RecordService.list()) : promiseResolve(null);
            }],
            vouchers: ['credentials', 'VoucherService', (credentials, VoucherService) => {
                return credentials ? repackResponse(VoucherService.list()) : promiseResolve([]);
            }],
            organizations: ['OrganizationService', (OrganizationService) => {
                return repackResponse(OrganizationService.list({ implementation: 1, is_employee: 0 }));
            }],
            funds: ['$transition$', 'FundService', ($transition$, FundService) => {
                return repackPagination(FundService.list(null, {
                    q: $transition$.params().q,
                    page: $transition$.params().page,
                    tag_id: $transition$.params().tag_id,
                    organization_id: $transition$.params().organization_id,
                    per_page: 10,
                    with_external: 1,
                }));
            }],
        }
    });

    i18n_state($stateProvider, {
        name: "fund",
        url: {
            en: "/funds/{id:int}",
            nl: "/fondsen/{id:int}",
        },
        component: "fundComponent",
        data: { id: null, searchData: null },
        params: { searchData: null },
        resolve: {
            configs: resolveConfigs(),
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById(
                $transition$.params().id
            ))],
            loadProducts: ['fund', (fund) => fund.type == 'budget'],
            loadSubsidies: ['fund', (fund) => fund.type == 'subsidies'],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : new Promise(resolve => resolve([]))],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
            products: ['$transition$', 'loadProducts', 'ProductService', (
                $transition$, loadProducts, ProductService
            ) => loadProducts ? repackPagination(ProductService.list({
                fund_type: 'budget',
                sample: 1,
                per_page: 6,
                fund_id: $transition$.params().id,
            })) : null],
            subsidies: ['$transition$', 'loadSubsidies', 'ProductService', (
                $transition$, loadSubsidies, ProductService
            ) => loadSubsidies ? repackPagination(ProductService.list({
                fund_type: 'subsidies',
                sample: 1,
                per_page: 6,
                fund_id: $transition$.params().id,
            })) : null],
        }
    });

    // Activate fund
    i18n_state($stateProvider, {
        name: "fund-activate",
        url: {
            en: "/funds/{fund_id}/activate?{digid_success:string}&{digid_error:string}&backoffice_error&backoffice_fallback&backoffice_error_key&backoffice_voucher",
            nl: "/fondsen/{fund_id}/activeer?{digid_success:string}&{digid_error:string}&backoffice_error&backoffice_fallback&backoffice_error_key&backoffice_voucher",
        },
        component: "fundActivateComponent",
        params: {
            fund_id: null,
            backoffice_error: null,
            backoffice_error_key: null,
            backoffice_fallback: null,
            backoffice_voucher: null,
            digid_success: routeParam(null, true),
            digid_error: routeParam(null, true),
        },
        resolve: {
            configs: resolveConfigs(),
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById($transition$.params().fund_id))],
            fundRequests: ['$transition$', 'FundRequestService', 'AuthService', (
                $transition$, FundRequestService, AuthService
            ) => AuthService.hasCredentials() ? repackPagination(
                FundRequestService.index($transition$.params().fund_id)
            ) : null],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : []],
        }
    });

    // Apply to fund by submitting fund request
    i18n_state($stateProvider, {
        name: "fund-request",
        url: {
            en: "/funds/{id}/request",
            en_fallback: "/fund/{id}/request",
            nl: "/fondsen/{id}/aanvraag",
        },
        component: "fundRequestComponent",
        params: { from: null },
        data: { id: null },
        resolve: {
            configs: resolveConfigs(),
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById(
                $transition$.params().id
            ))],
            fundRequests: ['$transition$', 'FundRequestService', 'AuthService', (
                $transition$, FundRequestService, AuthService
            ) => AuthService.hasCredentials() ? repackPagination(
                FundRequestService.index($transition$.params().id)
            ) : new Promise((resolve) => resolve(null))],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : []],
            records: ['AuthService', 'RecordService', (
                AuthService, RecordService
            ) => AuthService.hasCredentials() ? repackResponse(
                RecordService.list()
            ) : promiseResolve(null)],
        }
    });

    i18n_state($stateProvider, {
        name: "fund-request-show",
        url: {
            en: "/fund-request/{id}",
            nl: "/fondsen-aanvraag/{id}",
        },
        component: "fundRequestShowComponent",
        resolve: {
            configs: resolveConfigs(),
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            fundRequest: ['$transition$', 'FundRequestService', 'AuthService', (
                $transition$, FundRequestService, AuthService
            ) => AuthService.hasCredentials() ? repackResponse(
                FundRequestService.readRequester($transition$.params().id)
            ) : new Promise((resolve) => resolve(null))],
        }
    });

    i18n_state($stateProvider, {
        name: "fund-requests",
        url: {
            en: "/fund-requests?{page:int}&{fund_id:int}&{archived:int}",
            nl: "/fondsen-aanvraag?{page:int}&{fund_id:int}&{archived:int}",
        },
        component: "fundRequestsComponent",
        params: {
            page: routeParam(1),
            fund_id: routeParam(null),
            archived: routeParam(0),
        },
        resolve: {
            identity: ['AuthService', (
                AuthService
            ) => AuthService.hasCredentials() ? repackResponse(AuthService.identity()) : null],
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            fundRequests: ['$transition$', 'FundRequestService', 'AuthService', (
                $transition$, FundRequestService, AuthService
            ) => AuthService.hasCredentials() ? repackPagination(
                FundRequestService.indexRequester({
                    q: $transition$.params().q,
                    page: $transition$.params().page,
                    fund_id: $transition$.params().fund_id,
                    archived: $transition$.params().archived,
                    per_page: 15,
                    order_by: 'no_answer_clarification'
                })
            ) : new Promise((resolve) => resolve(null))],
        }
    });

    $stateProvider.state({
        name: "fund-request-clarification",
        url: "/funds/{fund_id}/requests/{request_id}/clarifications/{clarification_id}",
        data: { fund_id: null, request_id: null, clarification_id: null },
        controller: ['$state', '$transition$', function ($state, $transition$) {
            if ($transition$.params().clarification_id) {
                return $state.go('fund-request-show', { id: $transition$.params().request_id });
            }
            
            return $state.go('home');
        }],
    });

    $stateProvider.state({
        name: "restore-email",
        url: "/identity-restore?token&target",
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'ModalService', 'AuthService', function (
            $rootScope, $state, IdentityService, CredentialsService, ModalService, AuthService,
        ) {
            const { token, target } = $state.params;
            const { handleAuthTarget, onAuthRedirect } = AuthService;

            IdentityService.authorizeAuthEmailToken(token).then((res) => {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => !handleAuthTarget(target) && onAuthRedirect());
            }, () => {
                $state.go('home');

                if (!AuthService.hasCredentials()) {
                    ModalService.open('identityProxyExpired', {});
                }
            });
        }],
        data: {
            token: null
        }
    });

    $stateProvider.state({
        name: "confirmation-email",
        url: "/confirmation/email/{token}?target",
        data: {
            token: null
        },
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'PushNotificationsService', 'AuthService', function (
            $rootScope, $state, IdentityService, CredentialsService, PushNotificationsService, AuthService,
        ) {
            const { token, target } = $state.params;
            const { handleAuthTarget, onAuthRedirect } = AuthService;

            IdentityService.exchangeConfirmationToken(token).then(function (res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => !handleAuthTarget(target) && onAuthRedirect());
            }, (res) => {
                PushNotificationsService.danger(res.data.message, "Deze link is reeds gebruikt of ongeldig.", 'close');

                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: 'notifications',
        url: '/notifications?{page:int}',
        component: 'notificationsComponent',
    });

    $stateProvider.state({
        name: 'preferences-notifications',
        url: '/preferences/notifications',
        component: 'notificationPreferencesComponent',
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

    i18n_state($stateProvider, {
        name: 'security-sessions',
        url: {
            en: '/security/sessions',
            nl: '/beveiliging/sessies',
        },
        component: 'securitySessionsComponent',
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        }
    });

    i18n_state($stateProvider, {
        name: 'security-2fa',
        url: {
            en: '/security/2fa',
            nl: '/beveiliging/2fa',
        },
        component: 'security2FAComponent',
        resolve: {
            auth2FAState: ['Identity2FAService', (Identity2FAService) => {
                return repackResponse(Identity2FAService.status());
            }],
        },
    });

    i18n_state($stateProvider, {
        name: 'fund-pre-check',
        url: {
            en: '/fund-pre-check',
            nl: '/fund-pre-check',
        },
        component: 'fundPreCheckComponent',
        resolve: {
            funds: ['$transition$', 'FundService', ($transition$, FundService) => {
                return repackPagination(FundService.list(null, {
                    q: $transition$.params().q,
                    page: $transition$.params().page,
                    tag_id: $transition$.params().tag_id,
                    organization_id: $transition$.params().organization_id,
                    per_page: 10,
                    with_external: 1,
                }));
            }],
            organizations: ['OrganizationService', (OrganizationService) => {
                return repackResponse(OrganizationService.list({ implementation: 1, is_employee: 0 }));
            }],
            tags: ['TagService', (TagService) => {
                return repackResponse(TagService.list({ type: 'funds', per_page: 1000 }));
            }],
            preChecks: ['PreCheckService', (PreCheckService) => {
                return repackResponse(PreCheckService.list());
            }],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
        },
    });

    $stateProvider.state({
        name: 'error',
        url: '/error/{errorCode}',
        component: 'errorComponent',
        data: { errorCode: 'unknown_error' },
        params: { hideHomeLinkButton: false, customLink: null },
    });

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token&target",
        data: {
            token: null
        },
        controller: ['$state', '$rootScope', 'IdentityService', 'CredentialsService', 'AuthService', 'PushNotificationsService', function (
            $state, $rootScope, IdentityService, CredentialsService, AuthService, PushNotificationsService
        ) {
            const { token, target } = $state.params;
            const { handleAuthTarget, onAuthRedirect } = AuthService;

            IdentityService.exchangeShortToken(token).then((res) => {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => !handleAuthTarget(target) && onAuthRedirect());
            }, () => {
                PushNotificationsService.danger("Deze link is reeds gebruikt of ongeldig.");
                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: 'sitemap',
        url: '/sitemap',
        component: 'sitemapComponent'
    });

    $stateProvider.state({
        name: 'error-404',
        url: '/*params',
        component: 'errorPageComponent',
        resolve: {
            error: () => 404,
        }
    });

    $stateProvider.state({
        name: "redirect",
        url: "/redirect?target",
        controller: ['$state', 'AuthService', function ($state, AuthService) {
            if (!$state.params.target || !AuthService.handleAuthTarget($state.params.target)) {
                $state.go('home');
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