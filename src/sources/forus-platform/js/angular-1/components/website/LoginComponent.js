let LoginComponent = function($rootScope) {
    let $ctrl = this;

    $ctrl.selectType = (type) => {
        document.location.href = $rootScope.appConfigs.frontends['url_' + type];
    }
};

module.exports = {
    controller: ['$rootScope', LoginComponent],
    templateUrl: 'assets/tpl/pages/website/login.html'
};