require('./modules/select-control/SelectControlModule');
require('./modules/ui-controls/UIControlsModule');
require('./modules/page-loading-bar/PageLoadingBarModule');

let appConfigs = JSON.parse(JSON.stringify(env_data));
let app = angular.module('forusApp', [
    'pascalprecht.translate', 'ui.router', 'ngCookies', 
    'forus.selectControl', 'forus.uiControls', 'forus.pageLoadingBarModule',
]);

app.constant('appConfigs', appConfigs);

// Controllers
app.controller('BaseController', require('./controllers/BaseController'));

// Components
app.component('homeComponent', require('./components/HomeComponent'));
app.component('fundsComponent', require('./components/FundsComponent'));
app.component('vouchersComponent', require('./components/VouchersComponent'));
app.component('recordsComponent', require('./components/RecordsComponent'));
app.component('productsComponent', require('./components/ProductsComponent'));
app.component('productComponent', require('./components/ProductComponent'));
app.component('productApplyComponent', require('./components/ProductApplyComponent'));
app.component('voucherComponent', require('./components/VoucherComponent'));
app.component('fundApplyComponent', require('./components/FundApplyComponent'));
app.component('fundRequestComponent', require('./components/FundRequestComponent'));
app.component('fundRequestClarificationComponent', require('./components/FundRequestClarificationComponent'));
app.component('recordValidateComponent', require('./components/RecordValidateComponent'));
app.component('recordValidationsComponent', require('./components/RecordValidationsComponent'));
app.component('recordCreateComponent', require('./components/RecordCreateComponent'));
app.component('meComponent', require('./components/MeComponent'));
app.component('emailPreferencesComponent', require('./components/EmailPreferencesComponent'));

// Services
app.service('AuthService', require('./services/AuthService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('TransactionService', require('./services/TransactionService'));
app.service('FundService', require('./services/FundService'));
app.service('FundRequestService', require('./services/FundRequestService'));
app.service('FundRequestClarificationService', require('./services/FundRequestClarificationService'));
app.service('CredentialsService', require('./services/CredentialsService'));
app.service('FormBuilderService', require('./services/FormBuilderService'));
app.service('IdentityService', require('./services/IdentityService'));
app.service('RecordService', require('./services/RecordService'));
app.service('RecordTypeService', require('./services/RecordTypeService'));
app.service('RecordCategoryService', require('./services/RecordCategoryService'));
app.service('RecordValidationService', require('./services/RecordValidationService'));
app.service('QrScannerService', require('./services/QrScannerService'));
app.service('ProductCategoryService', require('./services/ProductCategoryService'));
app.service('OfficeService', require('./services/OfficeService'));
app.service('ProductService', require('./services/ProductService'));
app.service('ProviderFundService', require('./services/ProviderFundService'));
app.service('OrganizationValidatorService', require('./services/OrganizationValidatorService'));
app.service('PrevalidationService', require('./services/PrevalidationService'));
app.service('ProgressFakerService', require('./services/ProgressFakerService'));
app.service('ValidatorRequestService', require('./services/ValidatorRequestService'));
app.service('MediaService', require('./services/MediaService'));
app.service('VoucherService', require('./services/VoucherService'));
app.service('ValidatorService', require('./services/ValidatorService'));
app.service('GoogleMapService', require('./services/GoogleMapService'));
app.service('ConfigService', require('./services/ConfigService'));
app.service('ModalService', require('./services/ModalService'));
app.service('BrowserService', require('./services/BrowserService'));
app.service('SmsService', require('./services/SmsService'));
app.service('PrintableService', require('./services/PrintableService'));
app.service('BusinessTypeService', require('./services/BusinessTypeService'));
app.service('EmailPreferencesService', require('./services/EmailPreferencesService'));
app.service('FileService', require('./services/FileService'));
app.service('DigIdService', require('./services/DigIdService'));
app.service('PushNotificationsService', require('./services/PushNotificationsService'));

// Directives
app.directive('emptyBlock', require('./directives/EmptyBlockDirective'));
app.directive('topNavbar', require('./directives/TopNavbarDirective'));
app.directive('contactForm', require('./directives/ContactFormDirective'));
app.directive('webshops', require('./directives/WebshopsDirective'));
app.directive('implementation', require('./directives/ImplementationDirective'));
app.directive('fundCriterion', require('./directives/FundCriterionDirective'));
app.directive('profileCard', require('./directives/ProfileCardDirective'));
app.directive('blockProducts', require('./directives/BlockProductsDirective'));
app.directive('googleMap', require('./directives/GoogleMapDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));
app.directive('dashInputControl', require('./directives/DashInputControlDirective'));
app.directive('scrollTo', require('./directives/ScrollToDirective'));
app.directive('collapse', require('./directives/CollapseDirective'));
app.directive('voucherCard', require('./directives/VoucherCardDirective'));
app.directive('productCard', require('./directives/ProductCardDirective'));
app.directive('appFooter', require('./directives/AppFooterDirective'));
app.directive('i18n', require('./directives/I18nDirective'));
app.directive('preventPropagation', require('./directives/PreventPropagation'));
app.directive('phoneControl', require('./directives/PhoneControlDirective'));
app.directive('tooltip', require('./directives/TooltipDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('clickOutside', require('./directives/ClickOutsideDirective'));
app.directive('scrollEnd', require('./directives/ScrollEndDirective'));
app.directive('qrCode', require('./directives/QrCodeDirective'));
app.directive('fileUploader', require('./directives/controls/FileUploaderDirective'));
app.directive('pushNotifications', require('./directives/PushNotificationsDirective'));

app.directive('paginator', require('./directives/paginators/PaginatorDirective'));
app.directive('paginatorLoader', require('./directives/paginators/PaginatorLoaderDirective'));

app.directive('modalsRoot', require('./directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('./directives/modals/ModalItemDirective'));
app.directive('modalScrollBraker', require('./directives/modals/ModalScrollBrakerDirective'));

// Modal Components
app.component('modalNotificationComponent', require('./components/Modals/ModalNotificationComponent'));
app.component('modalOfficesComponent', require('./components/Modals/ModalOfficesComponent'));
app.component('modalAuthComponent', require('./components/Modals/ModalAuthComponent'));
app.component('modalPinCodeComponent', require('./components/Modals/ModalPinCodeComponent'));
app.component('modalActivateCodeComponent', require('./components/Modals/ModalActivateCodeComponent'));
app.component('modalAuthCodeComponent', require('./components/Modals/ModalAuthCodeComponent'));
app.component('modalShareVoucherComponent', require('./components/Modals/ModalShareVoucherComponent'));
app.component('modalOpenInMeComponent', require('./components/Modals/ModalOpenInMeComponent'));
app.component('modalProductApplyComponent', require('./components/Modals/ModalProductApplyComponent'));

// Printable Components
app.component('printableVoucherQrCodeComponent', require('./components/Printables/PrintableVoucherQrCodeComponent'));

// Providers
app.provider('PrintableRoute', require('./providers/PrintableRouteProvider'));
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('ModalRoute', require('./providers/ModalRouteProvider'));
app.provider('I18nLib', require('./providers/I18nLibProvider'));

// Printable
app.directive('printablesRoot', require('./directives/printables/PrintableRootDirective'));
app.directive('printableItem', require('./directives/printables/PrintableItemDirective'));
app.directive('printableEnabler', require('./directives/printables/PrintableEnablerDirective'));

// Filters
app.filter('currency_format', require('./filters/CurrencyFormatFilter'));
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('to_fixed', require('./filters/ToFixedFilter'));
app.filter('i18n', require('./filters/I18nFilter'));

// Config
app.config(require('./routers/printables'));
app.config(require('./routers/modals'));
app.config(require('./routers/router'));
app.config(require('./config/api-service'));
app.config(require('./config/i18n'));

app.run(require('./routers/router-transitions'));

app.run(['appConfigs', (appConfigs) => {
    let appFlags = require('./config/flags.js');
    let implementationflags = appFlags[env_data.client_key] || appFlags.general

    appConfigs.flags = Object.assign(implementationflags, env_data.flags || {})
}]);

// Bootstrap the app
angular.bootstrap(document.querySelector('html'), ['forusApp']);

if (!env_data.html5ModeEnabled) {
    let hash = document.location.hash;

    if (hash.length > 3 && hash[hash.length - 1] == '/') {
        document.location.hash = hash.slice(0, hash.length - 1);
    } else if (hash.length < 3) {
        document.location.hash = '#!/';
    }
}

module.exports = app;