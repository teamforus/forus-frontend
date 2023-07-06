const BaseController = function (
    $q,
    $state,
    $rootScope,
    $scope,
    $translate,
    IdentityService,
    Identity2FAService,
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

                $q.all([
                    RecordService.list().then((res) => auth_user.records = res.data),
                    Identity2FAService.status().then((res) => $rootScope.auth_2fa = res.data.data),
                ]).then(() => {
                    $rootScope.auth_user = auth_user;
                    $rootScope.$broadcast('identity:update', auth_user);
                    resolve($rootScope.auth_user);
                }, reject)
            }, (res) => {
                Identity2FAService.status().then((res) => $rootScope.auth_2fa = res.data.data),
                    reject(res);
            });
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
        $rootScope.auth_2fa = false;
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

    $rootScope.handleApi401 = ((data) => {
        if (data?.error == '2fa') {
            if ($rootScope.auth_user) {
                $rootScope.auth_user = false;
            }

            Identity2FAService.status().then((res) => $rootScope.auth_2fa = res.data.data);
            $state.go('auth-2fa');

            return true;
        }

        return false;
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
    '$translate',
    'IdentityService',
    'Identity2FAService',
    'AuthService',
    'RecordService',
    'ConfigService',
    '$filter',
    'appConfigs',
    'ModalService',
    BaseController
];
