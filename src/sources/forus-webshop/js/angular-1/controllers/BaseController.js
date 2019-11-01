let BaseController = function(
    $rootScope,
    $state,
    $q,
    $window,
    $translate,
    IdentityService,
    AuthService,
    RecordService,
    OrganizationService,
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
            let count = 0;
            let timer = (appConfigs.log_out_time || 15) * 60 * 1000;

            if (appConfigs.log_out_time !== false) {
                // sign out after :timer of inactivity (default: 15min)
                BrowserService.detectInactivity(timer).then(() => {
                    if (AuthService.hasCredentials()) {
                        IdentityService.deleteToken();
                        $rootScope.signOut();
    
                        ModalService.open('modalNotification', {
                            type: 'info',
                            description: 'modal.logout.description'
                        });
                    }
                }, () => {});
            }

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                auth_user.primary_email = res.data.filter((record) => {
                    return record.key == 'primary_email';
                })[0].value;

                ++count == 2 ? null : deferred.resolve();
            }, deferred.reject);

            OrganizationService.list().then((res) => {
                auth_user.organizations = res.data.data;
                auth_user.organizationsMap = {};
                auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    auth_user.organizationsMap[organization.id] = organization;
                    return organization.id;
                });

                ++count == 2 ? null : deferred.resolve();
            }, deferred.reject);

            $rootScope.auth_user = auth_user;
        }, deferred.reject);

        return deferred.promise;
    };

    $rootScope.$on('organization-changed', (event) => {
        $rootScope.activeOrganization = OrganizationService.active();
    });

    $rootScope.$on('auth:update', (event) => {
        $rootScope.loadAuthUser().then(() => $state.reload(), console.error);
    });

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = () => {
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

    $rootScope.pageTitle = $filter('translate')('page_title');
    $rootScope.client_key = appConfigs.client_key;

    $window.onbeforeunload = function (event) {
        BrowserService.unsetInactivity();
    };

    $translate.use('nl');
};

module.exports = [
    '$rootScope',
    '$state',
    '$q',
    '$window',
    '$translate',
    'IdentityService',
    'AuthService',
    'RecordService',
    'OrganizationService',
    'ConfigService',
    'BrowserService',
    '$filter',
    'appConfigs',
    'ModalService',
    BaseController
];