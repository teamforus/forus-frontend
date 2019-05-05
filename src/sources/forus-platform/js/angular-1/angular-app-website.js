let app = angular.module('forusApp', [
    'ui.router', 'pascalprecht.translate', 'ngCookies'
]);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/landing/BaseController'));
app.component('homeComponent', require('./components/landing/HomeComponent'));
app.component('signUpComponent', require('./components/landing/SignUpComponent'));

// Services
app.service('CredentialsService', require('./services/CredentialsService'));
app.service('ConfigService', require('./services/ConfigService'));
app.service('SmsService', require('./services/SmsService'));
app.service('AuthService', require('./services/AuthService'));
app.service('RecordService', require('./services/RecordService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('IdentityService', require('./services/IdentityService'));
app.service('FormBuilderService', require('./services/FormBuilderService'));
app.service('ModalService', require('./services/ModalService'));
app.service('OrganizationService', require('./services/OrganizationService'));


// Modal Components
app.component('modalAuth2Component', require('./components/Modals/ModalAuth2Component'));
app.component('modalAuthComponent', require('./components/Modals/ModalAuthComponent'));
app.component('modalPhotoUploaderComponent', require('./components/Modals/ModalPhotoUploaderComponent'));
app.component('modalFundTopUpComponent', require('./components/Modals/ModalFundTopUpComponent'));
app.component('modalEmployeeEditComponent', require('./components/Modals/ModalEmployeeEditComponent'));
app.component('modalNotificationComponent', require('./components/Modals/ModalNotificationComponent'));
app.component('modalMarkdownCustomLinkComponent', require('./components/Modals/ModalMarkdownCustomLinkComponent'));
app.component('modalPinCodeComponent', require('./components/Modals/ModalPinCodeComponent'));

// Directives
app.directive('landingNavbar', require('./directives/landing/NavbarDirective'));
app.directive('landingContactForm', require('./directives/landing/ContactFormDirective'));
app.directive('collapse', require('./directives/CollpaseDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('menuScrollToggle', require('./directives/landing/MenuScrollToggleDirective'));
app.directive('landingAppFooter', require('./directives/landing/LandingAppFooterDirective'));
app.directive('i18n', require('./directives/I18nDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));
app.directive('phoneControl', require('./directives/PhoneControlDirective'));
app.directive('tooltip', require('./directives/TooltipDirective'));

// Providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('I18nLib', require('./providers/I18nLibProvider'));
app.provider('ModalRoute', require('./providers/ModalRouteProvider'));

// Filters
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('i18n', require('./filters/I18nFilter'));

// Config
app.config(require('./routers/landing/router'));
app.config(require('./routers/modals'));
app.config(require('./config/i18n'));
app.config(require('./config/api-service'));

app.directive('modalsRoot', require('./directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('./directives/modals/ModalItemDirective'));
app.directive('modalScrollBraker', require('./directives/modals/ModalScrollBrakerDirective'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp']);

module.exports = app;