let ExplanationComponent = function(
    $state,
    $sce,
    appConfigs
) {
    let $ctrl = this;

    $ctrl.appConfigs = appConfigs;
    $ctrl.description_steps_html = $ctrl.appConfigs.features.settings.description_steps_html;
    
    $ctrl.description_steps_html = $sce.trustAsHtml(
        $ctrl.description_steps_html
    );;

    $ctrl.$onInit = () => {};
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<'
    },
    controller: [
        '$state',
        '$sce',
        'appConfigs',
        ExplanationComponent
    ],
    templateUrl: 'assets/tpl/pages/explanation.html'
};