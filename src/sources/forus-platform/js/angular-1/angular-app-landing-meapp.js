let app = angular.module('forusApp', [
    'ui.router', 'pascalprecht.translate', 'ngCookies'
]);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/landing/BaseController'));

// Services
app.service('CredentialsService', require('./services/CredentialsService'));
app.service('ConfigService', require('./services/ConfigService'));

// Directives
app.directive('landingNavbar', require('./directives/landing/NavbarDirective'));
app.directive('landingContactForm', require('./directives/landing/ContactFormDirective'));
app.directive('collapse', require('./directives/CollpaseDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('menuScrollToggle', require('./directives/landing/MenuScrollToggleDirective'));
app.directive('landingAppFooter', require('./directives/landing/LandingAppFooterDirective'));
app.directive('i18n', require('./directives/I18nDirective'));

// Providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('I18nLib', require('./providers/I18nLibProvider'));

// Filters
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('i18n', require('./filters/I18nFilter'));

// Config
app.config(require('./config/i18n'));
app.config(require('./config/api-service'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp']);

module.exports = app;