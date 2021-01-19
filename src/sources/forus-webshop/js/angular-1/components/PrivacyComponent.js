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

                $ctrl.description_privacy_html = $sce.trustAsHtml(
                    $ctrl.appConfigs.features.settings.description_privacy_html
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
