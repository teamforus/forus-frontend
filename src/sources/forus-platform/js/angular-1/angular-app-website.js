const app = angular.module('forusApp', [
    'ui.router', 'pascalprecht.translate', 'ngCookies', 'ngLocale'
]);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/landing/BaseController'));
app.controller('ToggleController', require('./controllers/landing/ToggleController.js'));

// Components
app.component('homeComponent', require('./components/website/HomeComponent'));
app.component('platformComponent', require('./components/website/PlatformComponent'));
app.component('meComponent', require('./components/website/MeComponent'));
app.component('contactComponent', require('./components/website/ContactComponent'));
app.component('currentComponent', require('./components/website/CurrentComponent'));
app.component('loginComponent', require('./components/website/LoginComponent'));
app.component('signUpComponent', require('./components/website/SignUpComponent'));
app.component('dlMeAppComponent', require('./components/landing/DlMeAppComponent'));

// Services
app.service('CredentialsService', require('./services/CredentialsService'));
app.service('ConfigService', require('./services/ConfigService'));
app.service('ShareService', require('./services/ShareService'));
app.service('AuthService', require('./services/AuthService'));
app.service('RecordService', require('./services/RecordService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('IdentityService', require('./services/IdentityService'));
app.service('FormBuilderService', require('./services/FormBuilderService'));
app.service('ModalService', require('./services/ModalService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('ContactService', require('./services/website/ContactService'));


// Modal Components
app.component('modalAuthComponent', require('./components/Modals/ModalAuthComponent'));
app.component('modalPhotoUploaderComponent', require('./components/Modals/ModalPhotoUploaderComponent'));
app.component('modalFundTopUpComponent', require('./components/Modals/ModalFundTopUpComponent'));
app.component('modalEmployeeEditComponent', require('./components/Modals/ModalEmployeeEditComponent'));
app.component('modalNotificationComponent', require('./components/Modals/ModalNotificationComponent'));
app.component('modalMarkdownCustomLinkComponent', require('./components/Modals/ModalMarkdownCustomLinkComponent'));
app.component('modalPinCodeComponent', require('./components/Modals/ModalPinCodeComponent'));
app.component('modalContactFormComponent', require('./components/Modals/website/ModalContactFormComponent'));

// Directives
app.directive('landingNavbar', require('./directives/landing/NavbarDirective'));
app.directive('landingContactForm', require('./directives/landing/ContactFormDirective'));
app.directive('collapse', require('./directives/CollpaseDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('menuScrollToggle', require('./directives/landing/MenuScrollToggleDirective'));
app.directive('i18n', require('./directives/I18nDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));
app.directive('phoneControl', require('./directives/PhoneControlDirective'));
app.directive('tooltip', require('./directives/TooltipDirective'));
app.directive('qrCode', require('./directives/QrCodeDirective'));
app.directive('clickOutside', require('./directives/ClickOutsideDirective'));
app.directive('openModalContactForm', require('./directives/website/OpenModalContactFormDirective'));
app.directive('contactForm', require('./directives/website/ContactFormDirective'));

app.directive('modalsRoot', require('./directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('./directives/modals/ModalItemDirective'));
app.directive('modalScrollBraker', require('./directives/modals/ModalScrollBrakerDirective'));

// Providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('hofApiRequest', require('./providers/website/HallOfFameApiRequestProvider'));
app.provider('I18nLib', require('./providers/I18nLibProvider'));
app.provider('ModalRoute', require('./providers/ModalRouteProvider'));

// Filters
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('i18n', require('./filters/I18nFilter'));
app.filter('str_limit', require('./filters/StrLimitFilter'));

// Config
app.config(require('./routers/landing/router'));
app.config(require('./routers/modals'));
app.config(require('./config/i18n'));
app.config(require('./config/api-service'));
//app.config(require('./config/website/hof-api-service'));

app.run(require('./routers/landing/router-transitions'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp']);

if (!env_data.html5ModeEnabled) {
    let hash = document.location.hash;

    if (hash.length > 3 && hash[hash.length - 1] == '/') {
        document.location.hash = hash.slice(0, hash.length - 1);
    } else if (hash.length < 3) {
        document.location.hash = '#!/';
    }
}

module.exports = app;