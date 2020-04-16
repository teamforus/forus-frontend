module.exports = ['$stateProvider', '$locationProvider', 'appConfigs', function(
    $stateProvider, $locationProvider, appConfigs
) {
    $stateProvider.state({
        name: "home",
        url: "/",
        component: "homeComponent"
    });

    $stateProvider.state({
        name: "history",
        url: "/geschiedenis",
        component: "historyComponent"
    });

    $stateProvider.state({
        name: "current",
        url: "/nu",
        component: "currentComponent"
    });

    $stateProvider.state({
        name: "future",
        url: "/toekomst",
        component: "futureComponent"
    });

    $stateProvider.state({
        name: "kindpakket",
        url: "/kindpakket",
        component: "kindpakketComponent"
    });

    $stateProvider.state({
        name: "kerstpakket",
        url: "/kerstpakket",
        component: "kerstpakketComponent"
    });

    $stateProvider.state({
        name: "meedoen",
        url: "/meedoen",
        component: "meedoenComponent"
    });

    $stateProvider.state({
        name: "platform",
        url: "/systeem",
        component: "platformComponent"
    });

    $stateProvider.state({
        name: "support",
        url: "/vragen",
        component: "supportComponent"
    });

    $stateProvider.state({
        name: "hall-of-fame",
        url: "/hall-of-fame",
        component: "hallOfFameComponent"
    });  

    $stateProvider.state({
        name: "me",
        url: "/me",
        component: "meComponent"
    });

    $stateProvider.state({
        name: "contact",
        url: "/contact",
        component: "contactComponent"
    });

    $stateProvider.state({
        name: "story",
        url: "/cs-zuidhorn",
        component: "storyComponent"
    });

    $stateProvider.state({
        name: "cs-nijmegen",
        url: "/cs-nijmegen",
        component: "csNijmegenComponent"
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
            function(
                $rootScope,
                $state,
                IdentityService,
                CredentialsService
            ) {
                IdentityService.authorizeAuthEmailToken(
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

    $stateProvider.state("otherwise", {
        url: "*path",
        component: "homeComponent"
    });

    if (appConfigs.html5ModeEnabled) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: true
        }).hashPrefix('!');
    }
}];