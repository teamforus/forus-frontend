const repackResponse = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(
        res.data.data ? res.data.data : res.data
    ), reject);
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

const routeParam = (value = null, squash = false, dynamic = false) => {
    return { value, squash, dynamic };
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
        controller: ['ConfigService', (ConfigService) => {
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
        controller: ['$state', ($state) => $state.go('sign-up')],
    });

    $stateProvider.state({
        name: "sign-up-redirect-en",
        url: "/providers/sign-in",
        controller: ['$state', ($state) => $state.go('sign-up-redirect')],
    });

    $stateProvider.state({
        name: "start",
        url: "/start?logout&restore_with_digid",
        component: "signUpComponent",
        params: {
            logout: null,
            restore_with_digid: null,
            digid_error: null,
            email_address: null,
            redirect_scope: false,
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
            en: "/products?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{favourites_only:bool}&{organization_id:int}&{distance:int}&{postcode:string}",
            nl: "/aanbod?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}&{distance:int}&{postcode:string}",
        },
        component: "productsComponent",
        params: {
            q: {
                dynamic: true,
                value: "",
                squash: true,
            },
            page: {
                dynamic: true,
                value: 1,
                squash: true,
            },
            fund_id: {
                value: null,
                squash: true
            },
            organization_id: {
                value: null,
                squash: true
            },
            product_category_id: {
                value: null,
                squash: true
            },
            display_type: {
                dynamic: true,
                value: 'list',
                squash: true
            },
            favourites_only: {
                dynamic: true,
                value: 0,
                squash: true
            },
            fund_type: {
                dynamic: true,
                value: 'budget',
                squash: true
            },
            show_menu: {
                dynamic: true,
                value: false,
                squash: true
            },
            distance: {
                dynamic: true,
                value: null,
                squash: true
            },
            postcode: {
                dynamic: true,
                value: '',
                squash: true
            },
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                q: $transition$.params().q,
                page: $transition$.params().page,
                fund_id: $transition$.params().fund_id,
                fund_type: $transition$.params().fund_type,
                organization_id: $transition$.params().organization_id,
                product_category_id: $transition$.params().product_category_id,
                favourites_only: $transition$.params().favourites_only
            }))],
            productCategories: ['ProductCategoryService', (ProductCategoryService) => {
                return repackResponse(ProductCategoryService.list({ parent_id: 'null', used: 1 }))
            }],
            organizations: ['OrganizationService', 'HelperService', (
                OrganizationService, HelperService
            ) => HelperService.recursiveLeacher((page) => {
                return OrganizationService.list({
                    is_employee: 0,
                    has_products: 1,
                    per_page: 100,
                    page: page,
                    fund_type: 'budget'
                });
            }, 4)],
        }
    });

    i18n_state($stateProvider, {
        name: "actions",
        url: {
            en: "/actions?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}",
            nl: "/acties?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}",
        },
        component: "productsComponent",
        params: {
            q: {
                dynamic: true,
                value: "",
                squash: true,
            },
            page: {
                dynamic: true,
                value: 1,
                squash: true,
            },
            fund_id: {
                value: null,
                squash: true
            },
            organization_id: {
                value: null,
                squash: true
            },
            product_category_id: {
                value: null,
                squash: true
            },
            display_type: {
                dynamic: true,
                value: 'list',
                squash: true
            },
            fund_type: {
                dynamic: true,
                value: 'subsidies',
                squash: true
            },
            show_menu: {
                dynamic: true,
                value: false,
                squash: true
            },
        },
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())],
            products: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackPagination(ProductService.list({
                q: $transition$.params().q,
                page: $transition$.params().page,
                fund_id: $transition$.params().fund_id,
                fund_type: $transition$.params().fund_type,
                organization_id: $transition$.params().organization_id,
                product_category_id: $transition$.params().product_category_id
            }))],
            productCategories: ['ProductCategoryService', (
                ProductCategoryService
            ) => repackResponse(ProductCategoryService.list({
                parent_id: 'null',
                used: 1,
            }))],
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
            en: "/providers?{page:int}&{q:string}&{fund_id:int}&{business_type_id:int}&{show_map:bool}&{show_menu:bool}&{distance:int}&{postcode:string}",
            nl: "/aanbieders?{page:int}&{q:string}&{fund_id:int}&{business_type_id:int}&{show_map:bool}&{show_menu:bool}&{distance:int}&{postcode:string}",
        },
        component: "providersComponent",
        params: {
            q: { dynamic: true, value: "", squash: true },
            page: { dynamic: true, value: 1, squash: true },
            fund_id: { value: null, squash: true },
            show_map: { value: false, squash: true },
            distance: { dynamic: true, value: null, squash: true },
            postcode: { dynamic: true, value: '', squash: true },
            show_menu: { dynamic: true, value: false, squash: true },
            business_type_id: { value: null, squash: true },
        },
        resolve: {
            funds: ['FundService', (FundService) => repackResponse(FundService.list())],
            businessTypes: ['BusinessTypeService', (
                BusinessTypeService
            ) => repackResponse(BusinessTypeService.list({
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
        url: "/search?{q:string}&{page:int}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}&{organization_id:int}&search_item_types&order_by&order_by_dir",
        params: {
            q: {
                dynamic: true,
                value: "",
                squash: true,
            },
            page: {
                dynamic: true,
                value: 1,
                squash: true,
            },
            fund_id: {
                dynamic: true,
                value: null,
                squash: true
            },
            organization_id: {
                dynamic: true,
                value: null,
                squash: true
            },
            product_category_id: {
                dynamic: true,
                value: null,
                squash: true
            },
            display_type: {
                dynamic: true,
                value: 'list',
                squash: true
            },
            search_item_types: {
                dynamic: true,
                value: 'funds,providers,products',
                squash: true
            },
            fund_type: {
                dynamic: true,
                value: 'budget',
                squash: true
            },
            order_by: { dynamic: true, value: 'created_at' },
            order_by_dir: { dynamic: true, value: 'desc' },
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
                        order_by_dir: $transition$.params().order_by_dir,
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
            }))],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : promiseResolve([])],
            organizations: ['OrganizationService', 'HelperService', (
                OrganizationService, HelperService
            ) => HelperService.recursiveLeacher((page) => {
                return OrganizationService.list({
                    is_employee: 0,
                    has_products: 1,
                    per_page: 100,
                    page: page,
                    fund_type: 'budget'
                });
            }, 4)],
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
            vouchers: ['VoucherService', (
                VoucherService
            ) => repackResponse(VoucherService.list())],
        }
    });

    i18n_state($stateProvider, {
        name: "favourite-products",
        url: {
            en: "/favourite-products",
            nl: "/favourite-products",
        },
        component: "favouriteProductsComponent",
        resolve: {
            products: ['ProductService', (
                ProductService
            ) => repackResponse(ProductService.list({
                favourites_only: 1
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
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())],
            reservations: ['ProductReservationService', (
                ProductReservationService
            ) => repackPagination(ProductReservationService.list({ per_page: 15 }))],
            organizations: ['OrganizationService', 'HelperService', (
                OrganizationService, HelperService
            ) => HelperService.recursiveLeacher((page) => {
                return OrganizationService.list({
                    is_employee: 0,
                    has_reservations: 1,
                    per_page: 100,
                    page: page,
                    fund_type: 'budget'
                });
            }, 4)],
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
            q: routeParam("", true, true),
            page: routeParam(1, true, true),
            tag_id: routeParam(null, true, true),
            show_menu: routeParam(false, true, true),
            display_type: routeParam('list', true, true),
            organization_id: routeParam(null, true, true),
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
            en: "/funds/{fund_id}/activate?digid_success&digid_error&backoffice_error&backoffice_fallback&backoffice_error_key&backoffice_voucher",
            nl: "/fondsen/{fund_id}/activeer?digid_success&digid_error&backoffice_error&backoffice_fallback&backoffice_error_key&backoffice_voucher",
        },
        component: "fundActivateComponent",
        params: {
            backoffice_error: null,
            backoffice_error_key: null,
            backoffice_fallback: null,
            backoffice_voucher: null,
        },
        data: {
            fund_id: null,
            digid_success: false,
            digid_error: false,
        },
        resolve: {
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
            en: "/funds/{id}/request?from",
            en_fallback: "/fund/{id}/request?from",
            nl: "/fondsen/{id}/aanvraag?from",
        },
        component: "fundRequestComponent",
        params: {
            id: null,
            from: null,
        },
        resolve: {
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

    // Apply to fund by submitting fund request
    $stateProvider.state({
        name: "fund-request-clarification",
        url: "/funds/{fund_id}/requests/{request_id}/clarifications/{clarification_id}",
        component: "fundRequestClarificationComponent",
        data: {
            fund_id: null,
            request_id: null,
            clarification_id: null,
        },
        resolve: {
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById(
                $transition$.params().fund_id
            ))],
            clarification: ['$transition$', 'FundRequestClarificationService', 'AuthService', (
                $transition$, FundRequestClarificationService, AuthService
            ) => AuthService.hasCredentials() ? repackResponse(FundRequestClarificationService.read(
                $transition$.params().fund_id,
                $transition$.params().request_id,
                $transition$.params().clarification_id
            )) : promiseResolve(null)],
        }
    });

    $stateProvider.state({
        name: "restore-email",
        url: "/identity-restore?token&target",
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'ModalService', 'AuthService', (
            $rootScope, $state, IdentityService, CredentialsService, ModalService, AuthService
        ) => {
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
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'PushNotificationsService', 'AuthService', (
            $rootScope, $state, IdentityService, CredentialsService, PushNotificationsService, AuthService
        ) => {
            const { token, target } = $state.params;
            const { handleAuthTarget, onAuthRedirect } = AuthService;

            IdentityService.exchangeConfirmationToken(token).then(function (res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser().then(() => !handleAuthTarget(target) && onAuthRedirect());
            }, (res) => {
                PushNotificationsService.danger(res.data.message, "Deze link is reeds gebruikt of ongeldig.", 'close', {
                    timeout: 8000,
                });

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
    });

    i18n_state($stateProvider, {
        name: 'security-sessions',
        url: {
            en: '/security/sessions',
            nl: '/beveiliging/sessies',
        },
        component: 'securitySessionsComponent',
    });

    $stateProvider.state({
        name: 'error',
        url: '/error/{errorCode}',
        component: 'errorComponent',
        data: { errorCode: 'unknown_error' },
        params: { hideHomeLinkButton: false },
    });

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token&target",
        data: {
            token: null
        },
        controller: ['$state', '$rootScope', 'IdentityService', 'CredentialsService', 'AuthService', 'PushNotificationsService', (
            $state, $rootScope, IdentityService, CredentialsService, AuthService, PushNotificationsService
        ) => {
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
        controller: ['$state', 'AuthService', ($state, AuthService) => {
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