module.exports = [
    'CredentialsService',
    // 'IdentityService',
    function(
        CredentialsService,
        // IdentityService
    ) {
        let subscriptions = {};

        return new(function() {
            this.hasCredentials = () => {
                return !!CredentialsService.get();
            };

            this.on = (action, callback) => {
                if (!subscriptions[action]) {
                    subscriptions[action] = [];
                }

                subscriptions[action].push(callback);
            };

            this.signOut = function() {
                return new Promise((done) => {
                    CredentialsService.set(null);

                    if (subscriptions.signIn && Array.isArray(subscriptions.signOut)) {
                        subscriptions.signOut.forEach((callback) => {
                            callback();
                        });
                    }

                    done();
                })
            };
        });
    }
];