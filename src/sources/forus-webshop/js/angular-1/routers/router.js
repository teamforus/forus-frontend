let repackResponse = (promise) => new Promise((resolve, reject) => {
    promise.then((res) => resolve(
        res.data.data ? res.data.data : res.data
    ), reject)
});

let promiseResolve = (res) => {
    return new Promise(resolve => resolve(res))
};

let handleAuthTarget = ($state, target) => {
    if (target[0] == 'homeStart') {
        return !!$state.go('home', {
            confirmed: true
        });
    }

    if (target[0] == 'fundRequest') {
        return !!$state.go('fund-request', {
            fund_id: target[1]
        });
    }

    return false;
};

module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {

    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent",
        params: {
            confirmed: null
        },
        resolve: {
            funds: ['FundService', (
                FundService
            ) => repackResponse(FundService.list())]
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
        url: "/funds",
        component: "fundsComponent",
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

    // Apply to fund by submitting fund request
    $stateProvider.state({
        name: "fund-request",
        url: "/fund/{fund_id}/request?digid&rid&aselect_credentials",
        component: "fundRequestComponent",
        data: {
            fund_id: null,
            digid: false,
            rid: null,
            aselect_credentials: null,
        },
        resolve: {
            fund: ['$transition$', 'FundService', (
                $transition$, FundService
            ) => repackResponse(FundService.readById(
                $transition$.params().fund_id
            ))],
            recordTypes: ['RecordTypeService', (
                RecordTypeService
            ) => repackResponse(RecordTypeService.list())],
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
        controller: ['$rootScope', '$state', 'IdentityService', 'CredentialsService', 'appConfigs', (
            $rootScope, $state, IdentityService, CredentialsService, appConfigs
        ) => {
            let target = $state.params.target || '';

            IdentityService.authorizeAuthEmailToken(
                appConfigs.client_key + '_webshop',
                $state.params.token
            ).then(function(res) {
                CredentialsService.set(res.data.access_token);
                $rootScope.loadAuthUser();

                if (typeof target == 'string') {
                    if (!handleAuthTarget($state, target.split('-'))) {
                        $state.go('home');
                    }
                }
            }, () => {
                alert("Token expired or unknown.");
                $state.go('home');
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
                alert("Token expired or unknown.");
                $state.go('home');
            });
        }]
    });

    $stateProvider.state({
        name: 'email-preferences',
        url: '/email/preferences',
        component: 'emailPreferencesComponent'
    });

    $stateProvider.state({
        name: "auth-link",
        url: "/auth-link?token",
        data: {
            token: null
        },
        controller: ['$state', '$rootScope', 'IdentityService', 'CredentialsService', (
            $state, $rootScope, IdentityService, CredentialsService
        ) => {
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
        }]
    });

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];