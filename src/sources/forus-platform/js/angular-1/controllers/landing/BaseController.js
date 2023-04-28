let BaseController = function(
    $rootScope,
    $scope,
    $state,
    $translate,
    appConfigs,
    ConfigService,
    IdentityService,
    AuthService,
    OrganizationService,
    ModalService
) {
    $rootScope.appConfigs = appConfigs;
    $scope.appConfigs = appConfigs;
    let $ctrl = this;

    ConfigService.get('dashboard').then((res) => {
        $rootScope.appConfigs.features = res.data;
        $rootScope.appConfigs.frontends = res.data.fronts;
    });
    
    $scope.openAuthPopup = () => $state.go('login');
    $scope.openPinCodePopup = () => ModalService.open('modalPinCode', {});

    $scope.$ctrl = {
        userMenuOpened: false,
        showFooter: true,
        showHeader: true
    };

    $scope.$ctrl.openUserMenu = (e) => {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
        
        $scope.$ctrl.userMenuOpened = !$scope.$ctrl.userMenuOpened;
    }

    $scope.$ctrl.hideUserMenu = () => {
        $scope.$apply(() => {
            $scope.$ctrl.userMenuOpened = false;
        });
    }

    $scope.$ctrl.goToHref = (href) => {
        document.location.href = href;
    }

    $rootScope.loadAuthUser = function() {
        IdentityService.identity().then((res) => {
            let auth_user = res.data;

            OrganizationService.list().then((res) => {
                $ctrl.organizations = res.data.data;
                if ($ctrl.organizations.length == 1) {
                    OrganizationService.use($ctrl.organizations[0].id);
                }
                auth_user.organizations = res.data.data;
                auth_user.organizationsMap = {};
                auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    auth_user.organizationsMap[organization.id] = organization;
                    return organization.id;
                });
            });

            $rootScope.auth_user = auth_user;
        });
    };

    let loadActiveOrganization = () => {
        let organizationId = OrganizationService.active();

        if (organizationId === false) {
            OrganizationService.clearActive();
        } else {
            OrganizationService.read(organizationId).then((res) => {
                $rootScope.activeOrganization = res.data.data;
            }, () => {
                OrganizationService.clearActive();
            });
        }
    };

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

    loadActiveOrganization();

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = (deleteToken = true) => {
        AuthService.signOut(deleteToken);
        $rootScope.auth_user = false;
        $rootScope.activeOrganization = null;
    };

    $scope.$watch(function() {
        return $state.$current.name
    }, function(newVal, oldVal) {
        // hide header and footer on listed pages
        $scope.$ctrl.showFooter = $scope.$ctrl.showHeader = [
            'login', 'sign-up', 'dl', 
        ].indexOf($state.current.name) === -1;

        if ([
            'sign-up', 'sign-up-provider', 
            'sign-up-sponsor', 'sign-up-validator'
        ].indexOf($state.current.name) != -1) {
            $rootScope.viewLayout = 'signup';
        } else {
            $rootScope.viewLayout = 'landing';
        }
    });

    $translate.use('nl');
    $rootScope.appConfigs = appConfigs;
};

module.exports = [
    '$rootScope',
    '$scope',
    '$state',
    '$translate',
    'appConfigs',
    'ConfigService',
    'IdentityService',
    'AuthService',
    'OrganizationService',
    'ModalService',
    BaseController
];