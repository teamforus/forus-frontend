let SignUpComponent = function(
    appConfigs,
    $stateParams
) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
        $ctrl.fromLoginPage = $stateParams.from_login_page;
    };
};

module.exports = {
    controller: [
        'appConfigs',
        '$stateParams',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/website/sign-up.html'
};