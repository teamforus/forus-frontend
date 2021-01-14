let PrivacyComponent = function(
    $scope,
    $sce,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && _appConfigs.features.settings) {
                $ctrl.appConfigs = _appConfigs;

                $ctrl.privacy_page_html = $sce.trustAsHtml(
                    $ctrl.appConfigs.features.settings.privacy_page_html
                );
            }
        }, true);
    };
}

module.exports = {
    controller: [
        '$scope',
        '$sce',
        'appConfigs',
        PrivacyComponent
    ],
    templateUrl: 'assets/tpl/pages/privacy.html'
};
