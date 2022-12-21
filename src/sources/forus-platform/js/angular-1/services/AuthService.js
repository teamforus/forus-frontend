module.exports = [
    '$timeout',
    '$rootScope',
    'IdentityService',
    'CredentialsService',
    function(
        $timeout,
        $rootScope,
        IdentityService,
        CredentialsService,
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
                        document.location.reload();
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

            this.signOut = function(deleteToken = true) {
                return new Promise(async (done) => {
                    if (deleteToken) {
                        await IdentityService.deleteToken();    
                    }

                    CredentialsService.set(null);

                    if (subscriptions.signIn && Array.isArray(subscriptions.signOut)) {
                        subscriptions.signOut.forEach((callback) => callback());
                    }

                    done();
                })
            };

            this.accessTokenSubscriber = () => {
                return new AccessTokenSubscriber();
            };

            /**
             * Redirect to state by given target
             * @param {string|null} rawTarget
             * @returns
             */
            this.handleAuthTarget = (rawTarget) => {
                return false;
            };
        });
    }
];