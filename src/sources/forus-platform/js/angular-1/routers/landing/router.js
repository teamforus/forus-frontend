module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {
    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent"
    });

    $stateProvider.state({
        name: "sign-up",
        url: "/sign-up",
        component: "signUpComponent"
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
                    appConfigs.client_key + '_' + appConfigs.panel_type,
                    $state.params.token
                ).then(function(res) {
                    CredentialsService.set(res.data.access_token);
                    $rootScope.loadAuthUser();
                    $state.go('home');
                }, () => {
                    alert("Helaas, het is niet gelukt om in te loggen. De link is reeds gebruikt of niet meer geldig. Probeer het opnieuw met een andere link.");
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