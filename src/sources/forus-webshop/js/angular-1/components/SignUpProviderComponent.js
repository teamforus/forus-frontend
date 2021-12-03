const SignUpProviderComponent = function($sce, appConfigs) {
    const $ctrl = this;

    $ctrl.$onInit = () => {
        const { content_html } = $ctrl.page;
        const { fronts } = $ctrl.configs;
        const { provider_sign_up_filters } = appConfigs;

        const params = provider_sign_up_filters || {};
        const paramKeys = Object.keys(params);

        $ctrl.signUpUrl = fronts.url_provider || '';
        $ctrl.signUpUrlParams = (paramKeys.length > 0 ? '?' : '') + paramKeys.map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');

        $ctrl.description_html = $sce.trustAsHtml(content_html);
    };
};

module.exports = {
    bindings: {
        page: '<',
        configs: '<',
    },
    controller: [
        '$sce',
        'appConfigs',
        SignUpProviderComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up-provider.html'
};