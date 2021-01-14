let SignUpSelectionComponent = function($scope, appConfigs, $sce) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;

        $scope.$watch(() => appConfigs, (configs) => {
            if (configs && configs.features && configs.features.settings) {
                $ctrl.description_providers_html = $sce.trustAsHtml(
                    configs.features.settings.description_providers_html
                );
            }
        }, true);
    };
};

module.exports = {
    bindings: {},
    controller: [
        '$scope',
        'appConfigs',
        '$sce',
        SignUpSelectionComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-options.html'
};