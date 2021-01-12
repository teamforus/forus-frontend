let SignUpSelectionComponent = function($scope, $sce, appConfigs) {
    let $ctrl = this;

    $ctrl.goToSignUpPage = (clientType) => {
        document.location.href = appConfigs.features.fronts['url_' + clientType] + 'sign-up';
    }

    $ctrl.$onInit = () => {
        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && _appConfigs.features.settings) {
                $ctrl.appConfigs = _appConfigs;

                $ctrl.description_providers_html = $sce.trustAsHtml(
                    $ctrl.appConfigs.features.settings.description_providers_html
                );
            }
        }, true);
    };
};

module.exports = {
    bindings: {},
    controller: [
        '$scope',
        '$sce',
        'appConfigs',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};