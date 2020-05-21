let ExplanationComponent = function(
    $sce,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.description_steps_html = $sce.trustAsHtml(
            appConfigs.features.settings.description_steps_html
        );
    };
};

module.exports = {
    bindings: {
        provider: '<'
    },
    controller: [
        '$sce',
        'appConfigs',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};