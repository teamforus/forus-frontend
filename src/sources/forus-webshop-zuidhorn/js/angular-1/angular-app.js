let app = angular.module('forusApp', ['ui.router', 'pascalprecht.translate', 'ngCookies']);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/BaseController'));

// Components
app.component('homeComponent', require('./components/HomeComponent'));
app.component('fundsComponent', require('./components/FundsComponent'));
app.component('vouchersComponent', require('./components/VouchersComponent'));
app.component('recordsComponent', require('./components/RecordsComponent'));
app.component('productsComponent', require('./components/ProductsComponent'));
app.component('productComponent', require('./components/ProductComponent'));
app.component('voucherComponent', require('./components/VoucherComponent'));
app.component('fundApplyComponent', require('./components/FundApplyComponent'));
app.component('recordValidateComponent', require('./components/RecordValidateComponent'));
app.component('recordValidationsComponent', require('./components/RecordValidationsComponent'));
app.component('recordCreateComponent', require('./components/RecordCreateComponent'));

// Services
app.service('AuthService', require('./services/AuthService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('TransactionService', require('./services/TransactionService'));
app.service('FundService', require('./services/FundService'));
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

// Directives
app.directive('emptyBlock', require('./directives/EmptyBlockDirective'));
app.directive('topNavbar', require('./directives/TopNavbarDirective'));
app.directive('popupAuth', require('./directives/PopupAuthDirective'));
app.directive('popupOffices', require('./directives/PopupOfficesDirective'));
app.directive('contactForm', require('./directives/ContactFormDirective'));
app.directive('fundCriterion', require('./directives/FundCriterionDirective'));
app.directive('profileCard', require('./directives/ProfileCardDirective'));
app.directive('blockProducts', require('./directives/BlockProductsDirective'));
app.directive('googleMap', require('./directives/GoogleMapDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));

// Providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));

// Filters
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('to_fixed', require('./filters/ToFixedFilter'));

// Config
app.config(require('./routers/router'));
app.config(require('./config/api-service'));
app.config(require('./config/i18n'));

app.run(require('./routers/router-transitions'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp', '720kb.datepicker']);

if (!env_data.html5ModeEnabled) {
    if (!document.location.hash) {
        document.location.hash = '#!/';
    }
}

module.exports = app;