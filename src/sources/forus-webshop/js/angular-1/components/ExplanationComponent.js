let ExplanationComponent = function(
    $sce,
    $timeout,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $timeout(() => {
            $ctrl.appConfigs = appConfigs;
            $ctrl.description_steps_html = $sce.trustAsHtml(
                appConfigs.features.settings.description_steps_html
            );
        }, 100);
    };
};

module.exports = {
    bindings: {
        provider: '<'
    },
    controller: [
        '$sce',
        '$timeout',
        'appConfigs',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};