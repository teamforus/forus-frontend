const { logout } = require("../i18n/nl/modals/modal");

let BaseController = function(
    $q,
    $state,
    $rootScope,
    $scope,
    $window,
    $translate,
    IdentityService,
    AuthService,
    RecordService,
    ConfigService,
    BrowserService,
    $filter,
    appConfigs,
    ModalService
) {
    $rootScope.loadAuthUser = function() {
        let deferred = $q.defer();

        AuthService.identity().then((res) => {
            let auth_user = res.data;
            let timer = (appConfigs.log_out_time || 15) * 60 * 1000;

            if (appConfigs.log_out_time !== false) {
                // sign out after :timer of inactivity (default: 15min)
                BrowserService.detectInactivity(timer).then(() => {
                    if (AuthService.hasCredentials()) {
                        $rootScope.signOut();

                        ModalService.open('modalNotification', {
                            type: 'confirm',
                            description: 'modal.logout.description',
                            confirmBtnText: 'Inloggen',
                            confirm: () => ModalService.open('modalAuth', {}),
                        });
                    }
                }, console.log);
            }

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                deferred.resolve();
            }, deferred.reject);

            $rootScope.auth_user = auth_user;
        }, deferred.reject);

        return deferred.promise;
    };

    $rootScope.$on('auth:update', (event) => {
        $rootScope.loadAuthUser().then(() => $state.reload(), console.error);
    });

    $rootScope.signOut = (
        $event = null,
        needConfirmation = false,
        deleteToken = true
    ) => {
        if ($event && typeof $event.preventDefault != 'undefined') {
            $event.preventDefault();
            $event.stopPropagation();
        };

        if (needConfirmation) {
            return ModalService.open('modalNotification', {
                type: "confirm",
                title: "logout.title_" + $rootScope.appConfigs.features.communication_type,
                confirmBtnText: "buttons.confirm",
                cancelBtnText: "buttons.cancel",
                confirm: () => {
                    $rootScope.signOut();
                },
                cancel: () => {}
            });
        }

        if (deleteToken) {
            IdentityService.deleteToken();
        }

        AuthService.signOut();

        $state.go('home');
        $rootScope.auth_user = false;
    };

    $rootScope.appConfigs = appConfigs;

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

    ConfigService.get('webshop').then((res) => {
        $rootScope.appConfigs.features = res.data;
    });

    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        if ($state.current.name == 'fund-request') {
            $rootScope.viewLayout = 'signup';
        }
    });

    $rootScope.pageTitle = $filter('translate')('page_title');
    $rootScope.client_key = appConfigs.client_key;

    $window.onbeforeunload = function(event) {
        BrowserService.unsetInactivity();
    };

    $translate.use(localStorage.getItem('lang') || 'nl');
};

module.exports = [
    '$q',
    '$state',
    '$rootScope',
    '$scope',
    '$window',
    '$translate',
    'IdentityService',
    'AuthService',
    'RecordService',
    'ConfigService',
    'BrowserService',
    '$filter',
    'appConfigs',
    'ModalService',
    BaseController
];
