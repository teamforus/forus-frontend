const AuthService = function (
    $q,
    $state,
    $timeout,
    appConfigs,
    $rootScope,
    ApiRequest,
    FundService,
    VoucherService,
    CredentialsService,
    IdentityService
) {
    const subscriptions = {};

    class AccessTokenSubscriber {
        constructor(checkInterval = 2500) {
            this.timeout = null;
            this.checkInterval = checkInterval;
        }

        stopCheckAccessTokenStatus() {
            if (this.timeout) {
                $timeout.cancel(this.timeout);
            }
        }

        checkAccessTokenStatus(access_token, success) {
            this.success = success;

            IdentityService.checkAccessToken(access_token).then(res => {
                if (res.data.message == 'active') {
                    this.applyAccessToken(access_token);
                } else if (res.data.message == 'pending') {
                    this.timeout = $timeout(() => {
                        this.checkAccessTokenStatus(access_token, success);
                    }, this.checkInterval);
                } else {
                    // document.location.reload();
                }
            });
        }

        applyAccessToken(access_token) {
            CredentialsService.set(access_token);
            $rootScope.$broadcast('auth:update');

            this.stopCheckAccessTokenStatus();
            this.success(access_token);
        };
    }

    return new (function () {
        this.hasCredentials = () => {
            return !!CredentialsService.get();
        };

        this.on = (action, callback) => {
            if (!subscriptions[action]) {
                subscriptions[action] = [];
            }

            subscriptions[action].push(callback);
        };


        this.signIn = function (values) {
            return new Promise(function (resolve, reject) {
                ApiRequest.post('/shop-keepers/devices', values).then((res) => {
                    if (subscriptions.signIn && Array.isArray(subscriptions.signIn)) {
                        subscriptions.signIn.forEach((callback) => {
                            callback();
                        });
                    }

                    resolve(res);
                }, reject);
            });
        };

        this.signOut = function () {
            CredentialsService.set(null);

            if (subscriptions.signIn && Array.isArray(subscriptions.signOut)) {
                subscriptions.signOut.forEach((callback) => callback());
            }
        };

        this.identity = function () {
            if (CredentialsService.get()) {
                return IdentityService.identity();
            }

            return new Promise((resolve) => resolve(null));
        };

        this.accessTokenSubscriber = () => {
            return new AccessTokenSubscriber();
        }

        /**
         * Redirect user after successful authentication
         * @param {*} defaultState 
         * @param {*} defaultStateParams 
         * @returns 
         */
        this.onAuthRedirect = (defaultState = 'home', defaultStateParams = {}) => {
            return $q.all([
                FundService.list().then((res) => res.data.data),
                VoucherService.list({ per_page: 100 }).then((res) => res.data.data),
            ]).then((data) => {
                const [funds, vouchers] = data;

                const takenFundIds = vouchers.filter((voucher) => !voucher.expired).map((voucher) => voucher.fund_id);
                const fundsList = funds.filter((fund) => fund.allow_direct_requests);
                const fundsNoVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) === -1);
                const fundsWithVouchers = fundsList.filter((fund) => takenFundIds.indexOf(fund.id) !== -1);

                // There are funds without vouchers
                if (fundsNoVouchers.length > 0) {
                    // Apply to the first form the list
                    if (appConfigs.flags.activateFirstFund || fundsNoVouchers.length == 1) {
                        return $state.go('fund-activate', { fund_id: fundsNoVouchers[0].id });
                    }

                    // Go to funds list
                    return $state.go('funds');
                }

                // There are funds with vouchers
                if (fundsWithVouchers.length > 0) {
                    // Go to the first vouchers
                    if (fundsWithVouchers.length === 1) {
                        return $state.go('voucher', {
                            address: vouchers.find((voucher) => voucher.fund_id === fundsWithVouchers[0].id).address
                        });
                    }

                    // Go to vouchers list
                    return $state.go('vouchers');
                }

                // Otherwise go home
                return defaultState !== false ? $state.go(defaultState, defaultStateParams) : false;
            });
        };

        /**
         * Redirect to state by given target
         * @param {string|null} rawTarget 
         * @returns 
         */
        this.handleAuthTarget = (rawTarget) => {
            const target = rawTarget ? rawTarget.split('-') : null;

            if (target && target[0] == 'fundRequest') {
                return target[1] ? !!$state.go('fund-request', {
                    id: target[1],
                }) : !!$state.go('start', {});
            }

            if (target && target[0] == 'voucher') {
                return !!$state.go('voucher', {
                    address: target[1],
                });
            }

            if (target && target[0] == 'requestClarification') {
                return target[1] ? !!$state.go('fund-request-clarification', {
                    fund_id: target[1],
                    request_id: target[2],
                    clarification_id: target[3],
                }) : !!$state.go('start', {});
            }

            return false;
        };
    });
};

module.exports = [
    '$q',
    '$state',
    '$timeout',
    'appConfigs',
    '$rootScope',
    'ApiRequest',
    'FundService',
    'VoucherService',
    'CredentialsService',
    'IdentityService',
    AuthService
];