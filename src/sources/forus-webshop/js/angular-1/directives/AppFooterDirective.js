const AppFooterDirective = function(
    $sce,
    $scope,
    $rootScope,
    appConfigs,
) {
    const $dir = $scope.$dir = {};
    const footerPageKeys = [
        'privacy', 'accessibility', 'terms_and_conditions',
    ];

    $rootScope.$watch('appConfigs', (configs) => {
        if (!configs || !configs.features || (typeof configs.features.pages !== 'object')) {
            return;
        }

        $scope.appConfigs = configs;

        const { pages } = configs.features;
        const { footer_opening_times, footer_contact_details } = pages;

        if (footer_opening_times && footer_opening_times.description_html) {
            $scope.description_opening_times_html = $sce.trustAsHtml(footer_opening_times.description_html);
        }

        if (footer_contact_details && footer_contact_details.description_html) {
            $scope.description_contact_details_html = $sce.trustAsHtml(footer_contact_details.description_html);
        }

        $dir.pageLinks = Object.values(pages).filter((page) => {
            return footerPageKeys.includes(page.page_type);
        });

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
    }, true);
};

module.exports = () => {
    return {
        scope: {
            settings: '=?',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$sce',
            '$scope',
            '$rootScope',
            'appConfigs',
            AppFooterDirective,
        ],
        templateUrl: 'assets/tpl/directives/app-footer.html',
    };
};