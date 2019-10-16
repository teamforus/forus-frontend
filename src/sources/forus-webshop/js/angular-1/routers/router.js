module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {
    let repackResponse = (promise) => {
        return new Promise((resolve, reject) => {
            promise.then((res) => {
                resolve(res.data.data ? res.data.data : res.data);
            }, reject);
        });
    }

    let promiseResolve = (res) => {
        return new Promise(resolve => resolve(res))
    };

    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent",
        params: {
            confirmed: null
        },
        resolve: {
            funds: function($transition$, FundService) {
                return repackResponse(
                    FundService.list()
                );
            }
        }
    });

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
        url: "/products",
        component: "productsComponent",
        resolve: {}
    });

    $stateProvider.state({
        name: "products-show",
        url: "/products/{id}",
        component: "productComponent",
        data: {
            id: null
        },
        resolve: {
            vouchers: function($transition$, AuthService, VoucherService) {
                return AuthService.hasCredentials() ? repackResponse(
                    VoucherService.list()
                ) : new Promise(resolve => resolve([]));
            },
            product: function($transition$, ProductService) {
                return repackResponse(
                    ProductService.read(
                        $transition$.params().id
                    )
                );
            },
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
            vouchers: function($transition$, AuthService, VoucherService) {
                return AuthService.hasCredentials() ? repackResponse(
                    VoucherService.list()
                ) : new Promise(resolve => resolve([]));
            },
            product: function($transition$, ProductService) {
                return repackResponse(
                    ProductService.read(
                        $transition$.params().id
                    )
                );
            },
        }
    });

    $stateProvider.state({
        name: "vouchers",
        url: "/vouchers",
        component: "vouchersComponent",
        resolve: {
            vouchers: function($transition$, VoucherService) {
                return repackResponse(
                    VoucherService.list()
                );
            },
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
            voucher: function($transition$, VoucherService) {
                return repackResponse(
                    VoucherService.get(
                        $transition$.params().address
                    )
                )
            }
        }
    });

    $stateProvider.state({
        name: 'records',
        url: '/records',
        component: 'recordsComponent',
        resolve: {
            records: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.list()
                )
            },
            recordTypes: function($transition$, RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            },
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
            record: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.read(
                        $transition$.params().id
                    )
                );
            },
            records: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.list()
                );
            },
            validators: function($transition$, ValidatorService) {
                return repackResponse(
                    ValidatorService.list()
                );
            },
            validationRequests: function($transition$, ValidatorRequestService) {
                return repackResponse(
                    ValidatorRequestService.list()
                );
            },
            recordTypes: function($transition$, RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            },
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
            record: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.read(
                        $transition$.params().id
                    )
                )
            },
            records: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.list()
                )
            },
            recordTypes: function($transition$, RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            },
        }
    });

    $stateProvider.state({
        name: 'record-create',
        url: '/records/create',
        component: 'recordCreateComponent',
        data: {},
        resolve: {
            recordTypes: function($transition$, RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            },
        }
    });

    $stateProvider.state({
        name: "funds",
        url: "/funds",
        component: "fundsComponent2",
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
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
            fund: function($transition$, FundService) {
                return repackResponse(
                    FundService.readById(
                        $transition$.params().id
                    )
                );
            },
            records: function($transition$, RecordService) {
                return repackResponse(
                    RecordService.list()
                );
            },
            recordTypes: function($transition$, RecordTypeService) {
                return repackResponse(
                    RecordTypeService.list()
                );
            },
            vouchers: ['VoucherService', (VoucherService) => repackResponse(
                VoucherService.list()
            )],
        }
    });

    // Apply to fund by submitting fund request
    $stateProvider.state({
        name: "fund-request",
        url: "/fund/{fund_id}/request",
        component: "fundRequestComponent",
        data: {
            fund_id: null
        },
        resolve: {
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById($transition$.params().fund_id))],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
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
                    appConfigs.client_key + '_webshop',
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
        name: 'email-preferences',
        url: '/email/preferences',
        component: 'emailPreferencesComponent'
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

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];