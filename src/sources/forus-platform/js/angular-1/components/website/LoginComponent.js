let LoginComponent = function(
    $rootScope
) {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;

        document.location.href = $rootScope.appConfigs.frontends['url_' + $ctrl.selectedType];
    }

    $ctrl.login = () => {
        document.location.href = '#!/register';
    };
};

module.exports = {
    controller: [
        '$rootScope',
        LoginComponent
    ],
    templateUrl: 'assets/tpl/pages/website/login.html'
};