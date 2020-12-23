let SignUpComponent = function(appConfigs) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
    };
};

module.exports = {
    controller: [
        'appConfigs',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/website/sign-up.html'
};