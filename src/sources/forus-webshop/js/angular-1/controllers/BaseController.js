const BaseController = function (
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
    $filter,
    appConfigs,
    ModalService
) {
    const $trans = $filter('translate');

    $rootScope.loadAuthUser = () => {
        return $q((resolve, reject) => {
            AuthService.identity().then((res) => {
                const auth_user = res.data;

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
            redirect($state);
        }

        if (redirect && typeof redirect == 'string') {
            $state.go(redirect);
        }
    };

    $rootScope.$on('auth:update', () => {
        $rootScope.loadAuthUser();
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
    '$filter',
    'appConfigs',
    'ModalService',
    BaseController
];
