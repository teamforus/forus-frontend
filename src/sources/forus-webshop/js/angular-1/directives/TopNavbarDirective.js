const TopNavbarDirective = function (
    $state,
    $scope,
    appConfigs,
    ModalService,
    ConfigService
) {
    const $dir = $scope.$dir;

    $dir.visible = false;
    $dir.prevOffsetY = false;
    $dir.userMenuOpened = false;

    $dir.startFundRequest = (data = {}) => {
        $state.go('start', data, { reload: true, inherit: false });
    };

    $dir.openPinCodePopup = () => {
        $dir.userMenuOpened = false;
        ModalService.open('modalPinCode');
    };

    $dir.openUserMenu = ($e) => {
        if ($e?.target?.tagName != 'A') {
            $e.stopPropagation();
            $e.preventDefault();
        }

        $dir.userMenuOpened = !$dir.userMenuOpened;
    }

    $dir.hideUserMenu = () => {
        $dir.userMenuOpened = false;
    }

    const updateScrolled = function () {
        const currentOffsetY = window.pageYOffset;

        $dir.visible = ($dir.prevOffsetY > currentOffsetY) || (currentOffsetY <= 0);
        $dir.prevOffsetY = currentOffsetY;
    };

    $dir.$onInit = () => {
        window.addEventListener('scroll', updateScrolled);
        $dir.logoExtension = ConfigService.getFlag('logoExtension');

        $dir.socialMedias = appConfigs.features.social_medias;

        if ($dir.socialMedias.length) {
            $dir.facebookMedia = $dir.socialMedias.find(socialMedia => {
                return socialMedia.type == 'facebook';
            });
    
            $dir.twitterMedia = $dir.socialMedias.find(socialMedia => {
                return socialMedia.type == 'twitter';
            });
    
            $dir.youtubeMedia = $dir.socialMedias.find(socialMedia => {
                return socialMedia.type == 'youtube';
            });
        }
    };

    $dir.$onDestroy = () => {
        window.removeEventListener('scroll', updateScrolled);
    };
};

module.exports = () => {
    return {
        scope: {
            hideOnScroll: '=',
            searchResultPage: '=',
            query: '=',
        },
        restrict: "EA",
        replace: true,
        controllerAs: '$dir',
        controller: [
            '$state',
            '$scope',
            'appConfigs',
            'ModalService',
            'ConfigService',
            TopNavbarDirective
        ],
        templateUrl: 'assets/tpl/directives/top-navbar.html'
    };
};