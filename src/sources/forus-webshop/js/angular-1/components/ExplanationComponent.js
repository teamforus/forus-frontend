let ExplanationComponent = function(
    $sce,
    $scope,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $scope.appConfigs = appConfigs;
        $scope.$watch('appConfigs', (_appConfigs) => {
            if (_appConfigs.features && _appConfigs.features.settings) {
                $ctrl.appConfigs = _appConfigs;

                $ctrl.description_steps_html = $sce.trustAsHtml(
                    $ctrl.appConfigs.features.settings.description_steps_html
                );
            }
        }, true);
    };
};

module.exports = {
    bindings: {
        provider: '<',
        funds: '<',
    },
    controller: [
        '$sce',
        '$scope',
        'appConfigs',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};