const BaseController = function(
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
    const $trans = $filter('translate');

    $rootScope.loadAuthUser = () => {
        return $q((resolve, reject) => {
            AuthService.identity().then((res) => {
                const auth_user = res.data;
                const timer = (appConfigs.log_out_time || 15) * 60 * 1000;

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
                    }, console.error);
                }

                RecordService.list().then((res) => {
                    auth_user.records = res.data;
                    resolve();
                }, reject);

                $rootScope.auth_user = auth_user;
                $rootScope.$broadcast('identity:update', auth_user);
            }, reject);
        });
    };

    $rootScope.signOut = (
        $event = null,
        needConfirmation = false,
        deleteToken = true,
        redirect = 'home'
    ) => {
        if ($event && typeof $event.preventDefault != 'undefined') {
            $event.preventDefault();
            $event.stopPropagation();
        };

        if (needConfirmation) {
            return ModalService.open('modalNotification', {
                type: "confirm",
                title: "logout.title_" + appConfigs.features.communication_type,
                confirmBtnText: "buttons.confirm",
                cancelBtnText: "buttons.cancel",
                confirm: () => $rootScope.signOut(),
                cancel: () => { }
            });
        }

        if (deleteToken) {
            IdentityService.deleteToken();
        }

        AuthService.signOut();
        $rootScope.auth_user = false;
        $rootScope.$broadcast('identity:update', null);

        if (redirect && typeof redirect == 'function') {
            redirect();
        }

        if (redirect && typeof redirect == 'string') {
            $state.go(redirect);
        }
    };

    $rootScope.$on('auth:update', () => {
        $rootScope.loadAuthUser().then(() => $state.reload(), console.error);
    });

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

    ConfigService.get('webshop').then((res) => {
        appConfigs.features = res.data;
    });

    $scope.$watch(() => $state.$current.name, () => {
        if ($state.current.name == 'fund-request') {
            $rootScope.viewLayout = 'signup';
        }
    });

    $rootScope.appConfigs = appConfigs;
    $rootScope.client_key = appConfigs.client_key;
    $rootScope.pageTitle = $trans('page_title');

    $window.onbeforeunload = function() {
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
