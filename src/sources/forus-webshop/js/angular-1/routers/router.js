let repackResponse = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(
        res.data.data ? res.data.data : res.data
    ), reject);
});

let repackPagination = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(res.data), reject);
});

let promiseResolve = (res) => {
    return new Promise(resolve => resolve(res));
};

let handleAuthTarget = ($state, target) => {
    if (target[0] == 'homeStart') {
        return !!$state.go('home', {
            confirmed: true
        });
    }

    if (target[0] == 'fundRequest') {
        return target[1] ? !!$state.go('fund-request', {
            fund_id: target[1]
        }) : !!$state.go('start', {});
    }

    if (target[0] == 'voucher') {
        return !!$state.go('voucher', {
            address: target[1]
        });
    }

    if (target[0] == 'requestClarification') {
        return target[1] ? !!$state.go('fund-request-clarification', {
            fund_id: target[1],
            request_id: target[2],
            clarification_id: target[3]
        }) : !!$state.go('start', {});
    }

    return false;
};

module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {
    $stateProvider.state({
        name: "home",
        url: "/?digid_error",
        component: "homeComponent",
        params: {
            confirmed: null,
            digid_error: null
        },
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())]
        }
    });

    $stateProvider.state({
        name: "sign-up",
        url: "/sign-up",
        component: "signUpSelectionComponent",
        params: {
            confirmed: null,
            digid_error: null
        },
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())]
        }
    });

    $stateProvider.state({
        name: "start",
        url: "/start",
        component: "signUpComponent",
        params: {
            confirmed: null,
            digid_error: null
        },
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())],
        }
    });

    if (appConfigs.flags && appConfigs.flags.accessibilityPage) {
        $stateProvider.state({
            name: "accessibility",
            url: "/accessibility",
            component: "accessibilityComponent",
        });
    }
    
    if (appConfigs.flags && appConfigs.flags.privacyPage) {
        $stateProvider.state({
            name: "privacy",
            url: "/privacy",
            component: "privacyComponent",
        });
    }

    $stateProvider.state({
        name: "me-app",
        url: "/me",
        component: "meComponent",
        params: {
            confirmed: null
        }
    });

    $stateProvider.state({
        name: "products",
        url: "/products?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}",
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
                value: 'budget',
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
                    fund_type: 'budget'
                });
            }, 4)],
        }
    });

    $stateProvider.state({
        name: "actions",
        url: "/actions?{page:int}&{q:string}&{fund_id:int}&{display_type:string}&{product_category_id:int}&{show_menu:bool}",
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

    $stateProvider.state({
        name: "products-show",
        url: "/products/{id}",
        component: "productComponent",
        data: {
            id: null
        },
        resolve: {
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : new Promise(resolve => resolve([]))],
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().id
            ))],
        }
    });

    $stateProvider.state({
        name: "providers",
        url: "/providers?{page:int}&{q:string}&{fund_id:int}&{business_type_id:int}&{show_map:bool}&{show_menu:bool}",
        component: "providersComponent",
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
            business_type_id: {
                value: null,
                squash: true
            },
            show_map: {
                value: false,
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
                business_type_id: $transition$.params().business_type_id,
            }))]
        }
    });

    $stateProvider.state({
        name: "explanation",
        url: "/explanation",
        component: "explanationComponent",
        params: {},
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())]
        }
    });

    $stateProvider.state({
        name: "provider-office",
        url: "/providers/{provider_id}/offices/{office_id}",
        component: "providerOfficeComponent",
        resolve: {
            provider: ['$transition$', 'ProvidersService', (
                $transition$, ProvidersService
            ) => repackResponse(ProvidersService.read(
                $transition$.params().provider_id
            ))],
            office: ['$transition$', 'OfficeService', (
                $transition$, OfficeService
            ) => repackResponse(OfficeService.read(
                $transition$.params().office_id
            ))]
        }
    });

    $stateProvider.state({
        name: "provider",
        url: "/providers/{provider_id}",
        component: "providerComponent",
        resolve: {
            provider: ['$transition$', 'ProvidersService', (
                $transition$, ProvidersService
            ) => repackResponse(ProvidersService.read(
                $transition$.params().provider_id
            ))],
        }
    });

    $stateProvider.state({
        name: "products-apply",
        url: "/products/{id}/apply",
        component: "productApplyComponent",
        data: {
            id: null
        },
        resolve: {
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : new Promise(resolve => resolve([]))],
            product: ['$transition$', 'ProductService', (
                $transition$, ProductService
            ) => repackResponse(ProductService.read(
                $transition$.params().id
            ))],
        }
    });

    $stateProvider.state({
        name: "vouchers",
        url: "/vouchers",
        component: "vouchersComponent",
        resolve: {
            vouchers: ['VoucherService', (
                VoucherService
            ) => repackResponse(VoucherService.list())],
        }
    });

    $stateProvider.state({
        name: 'voucher',
        url: '/voucher/{address}',
        component: 'voucherComponent',
        data: {
            address: null
        },
        resolve: {
            voucher: ['$transition$', 'VoucherService', (
                $transition$, VoucherService
            ) => repackResponse(VoucherService.get(
                $transition$.params().address
            ))]
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

    $stateProvider.state({
        name: "funds",
        url: "/funds?{page:int}&{q:string}&{display_type:string}&{organization_id:int}&{show_menu:bool}",
        component: "fundsComponent",
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
            organization_id: {
                value: null,
                squash: true
            },
            display_type: {
                dynamic: true,
                value: 'list',
                squash: true
            },
            show_menu: {
                dynamic: true,
                value: false,
                squash: true
            },
        },
        resolve: {
            funds: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackPagination(FundService.list(null, {
                q: $transition$.params().q,
                page: $transition$.params().page,
                organization_id: $transition$.params().organization_id,
                per_page: 10,
            }))],
            records: ['AuthService', 'RecordService', (
                AuthService, RecordService
            ) => AuthService.hasCredentials() ? repackResponse(
                RecordService.list()
            ) : promiseResolve(null)],
            vouchers: ['AuthService', 'VoucherService', (
                AuthService, VoucherService
            ) => AuthService.hasCredentials() ? repackResponse(
                VoucherService.list()
            ) : promiseResolve([])],
            organizations: ['OrganizationService', (
                OrganizationService
            ) => repackResponse(OrganizationService.list({
                implementation: 1,
                is_employee: 0
            }))],
        }
    });

    $stateProvider.state({
        name: "fund-apply",
        url: "/funds/{id}",
        component: "fundApplyComponent",
        data: {
            id: null
        },
        resolve: {
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById(
                $transition$.params().id
            ))],
            records: ['RecordService', (
                RecordService
            ) => repackResponse(RecordService.list())],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
            vouchers: ['VoucherService', (
                VoucherService
            ) => repackResponse(VoucherService.list())],
        }
    });

    // Activate fund
    $stateProvider.state({
        name: "fund-activate",
        url: "/funds/{fund_id}/activate?digid_success&digid_error",
        component: "fundActivateComponent",
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
    $stateProvider.state({
        name: "fund-request",
        url: "/fund/{fund_id}/request?digid_success&digid_error",
        component: "fundRequestComponent",
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
            ) => repackResponse(FundService.readById(
                $transition$.params().fund_id
            ))],
            fundRequests: ['$transition$', 'FundRequestService', 'AuthService', (
                $transition$, FundRequestService, AuthService
            ) => AuthService.hasCredentials() ? repackPagination(
                FundRequestService.index($transition$.params().fund_id)
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
            records: ['AuthService', 'RecordService', (
                AuthService, RecordService
            ) => AuthService.hasCredentials() ? repackResponse(
                RecordService.list()
            ) : promiseResolve(null)],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
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
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'ModalService', 'AuthService', 'appConfigs', (
            $rootScope, $state, IdentityService, CredentialsService, ModalService, AuthService, appConfigs
        ) => {
            let target = $state.params.target || '';

            IdentityService.authorizeAuthEmailToken(
                $state.params.token
            ).then(function(res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser();

                if (typeof target == 'string') {
                    if (!handleAuthTarget($state, target.split('-'))) {
                        $state.go('vouchers');
                    }
                }
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
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', (
            $rootScope, $state, IdentityService, CredentialsService
        ) => {
            let target = $state.params.target || '';

            IdentityService.exchangeConfirmationToken(
                $state.params.token
            ).then(function(res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser();

                if (typeof target == 'string') {
                    if (!handleAuthTarget($state, target.split('-'))) {
                        $state.go('home', {
                            confirmed: 1
                        });
                    }
                }
            }, () => {
                alert("Deze link is reeds gebruikt of ongeldig.");
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
        component: 'emailPreferencesComponent'
    });

    $stateProvider.state({
        name: 'identity-emails',
        url: '/preferences/emails',
        component: 'identityEmailsComponent'
    });

    $stateProvider.state({
        name: 'security-sessions',
        url: '/security/sessions',
        component: 'securitySessionsComponent'
    });

    $stateProvider.state({
        name: 'error',
        url: '/error/{errorCode}',
        component: 'errorComponent',
        data: {
            errorCode: 'unknown_error',
        }
    });

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token&target",
        data: {
            token: null
        },
        controller: ['$state', '$rootScope', 'IdentityService', 'CredentialsService', 'PushNotificationsService', (
            $state, $rootScope, IdentityService, CredentialsService, PushNotificationsService
        ) => {
            let target = $state.params.target || '';

            IdentityService.exchangeShortToken($state.params.token).then(res => {
                CredentialsService.set(res.data.access_token);

                $rootScope.loadAuthUser().then(() => {
                    if (typeof target == 'string') {
                        if (!handleAuthTarget($state, target.split('-'))) {
                            $state.go('home');
                        }
                    }
                });
            }, () => {
                PushNotificationsService.danger("Deze link is reeds gebruikt of ongeldig.");
                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: 'error-404',
        url: '/*params',
        component: 'errorPageComponent',
        resolve: {
            error: () => 404,
        }
    });

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];