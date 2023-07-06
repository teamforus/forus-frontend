const AppFooterDirective = function(
    $sce,
    $scope,
    $rootScope,
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
        const { footer_opening_times, footer_contact_details, footer_app_info } = pages;

        if (footer_opening_times && footer_opening_times.description_html) {
            $scope.description_opening_times_html = $sce.trustAsHtml(footer_opening_times.description_html);
        }

        if (footer_contact_details && footer_contact_details.description_html) {
            $scope.description_contact_details_html = $sce.trustAsHtml(footer_contact_details.description_html);
        }

        if (footer_app_info && footer_app_info.description_html) {
            $scope.description_footer_app_info_position = footer_app_info.description_position;
            $scope.description_footer_app_info_html = $sce.trustAsHtml(footer_app_info.description_html);
        }

        $dir.pageLinks = Object.values(pages).filter((page) => {
            return footerPageKeys.includes(page.page_type);
        });
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
            AppFooterDirective,
        ],
        templateUrl: 'assets/tpl/directives/app-footer.html',
    };
};