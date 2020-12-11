let SignUpComponent = function(
    $rootScope
) {
    let $ctrl = this;

    $ctrl.selectedType = null;

    $ctrl.selectType = (type) => {
        $ctrl.selectedType = $ctrl.selectedType == type ? null : type;

        document.location.href = $rootScope.appConfigs.frontends['url_' + $ctrl.selectedType] + 'sign-up';
    }

    $ctrl.signUp = () => {
        document.location.href = '#!/login';
    };
};

module.exports = {
    controller: [
        '$rootScope',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/website/sign-up.html'
};