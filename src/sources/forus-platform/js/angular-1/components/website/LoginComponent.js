let LoginComponent = function(appConfigs) {
    let $ctrl = this;

    $ctrl.$onInit = () => {
        $ctrl.appConfigs = appConfigs;
    };
};

module.exports = {
    controller: [
        'appConfigs', 
        LoginComponent
    ],
    templateUrl: 'assets/tpl/pages/website/login.html'
};