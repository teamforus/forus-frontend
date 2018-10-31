let app = angular.module('forusApp', ['pascalprecht.translate', 'ngCookies']);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', [
    '$rootScope',
    '$scope',
    'appConfigs',
    function(
        $rootScope,
        $scope,
        appConfigs
    ) {
        $rootScope.appConfigs = appConfigs;
        $scope.appConfigs = appConfigs;
    }
]);

// Services

// Directives
app.directive('landingNavbar', require('./directives/landing/NavbarDirective'));
app.directive('landingContactForm', require('./directives/landing/ContactFormDirective'));
app.directive('collapse', require('./directives/CollpaseDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));

// Providers

// Filters

// Config
app.config(require('./config/i18n'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp']);

module.exports = app;