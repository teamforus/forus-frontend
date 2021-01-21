let SignUpSelectionComponent = function($scope, appConfigs, $sce) {
    const $ctrl = this;

    $ctrl.signUpUrl = "";
    $ctrl.signUpUrlParams = "";

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;

        $scope.$watch(() => appConfigs, (configs) => {
            if (!configs) {
                return;
            }

            if (configs.features) {
                if (configs.features.settings) {
                    $ctrl.description_providers_html = $sce.trustAsHtml(
                        configs.features.settings.description_providers_html
                    );
                }

                if (configs.features.fronts) {
                    const params = configs.provider_sign_up_filters || {};
                    const paramKeys = Object.keys(params);

                    $ctrl.signUpUrl = configs.features.fronts.url_provider || '';
                    $ctrl.signUpUrlParams = (paramKeys.length > 0 ? '?' : '');

                    $ctrl.signUpUrlParams += paramKeys.map((key) => {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                    }).join('&');
                }
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