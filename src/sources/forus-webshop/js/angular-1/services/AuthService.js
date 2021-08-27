let AuthService = function(
    $timeout,
    $rootScope,
    ApiRequest,
    CredentialsService,
    IdentityService
) {
    let subscriptions = {};

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

    return new (function() {
        this.hasCredentials = () => {
            return !!CredentialsService.get();
        };

        this.on = (action, callback) => {
            if (!subscriptions[action]) {
                subscriptions[action] = [];
            }

            subscriptions[action].push(callback);
        };


        this.signIn = function(values) {
            return new Promise(function(resolve, reject) {
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

        this.signOut = function() {
            CredentialsService.set(null);

            if (subscriptions.signIn && Array.isArray(subscriptions.signOut)) {
                subscriptions.signOut.forEach((callback) => callback());
            }
        };

        this.identity = function() {
            if (CredentialsService.get()) {
                return IdentityService.identity();
            }

            return new Promise((resolve) => resolve(null));
        };

        this.accessTokenSubscriber = () => {
            return new AccessTokenSubscriber();
        }
    });
};

module.exports = [
    '$timeout',
    '$rootScope',
    'ApiRequest',
    'CredentialsService',
    'IdentityService',
    AuthService
];