let app = angular.module('forusApp', ['ui.router']);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/BaseController'));

// Components
app.component('homeComponent', require('./components/HomeComponent'));
app.component('organizationsComponent', require('./components/OrganizationsComponent'));
app.component('organizationsEditComponent', require('./components/OrganizationsEditComponent'));
app.component('fundsComponent', require('./components/FundsComponent'));
app.component('fundsMyComponent', require('./components/FundsMyComponent'));
app.component('providerFundsAvailableComponent', require('./components/ProviderFundsAvailableComponent'));
app.component('providerFundsComponent', require('./components/ProviderFundsComponent'));
app.component('fundsEditComponent', require('./components/FundsEditComponent'));
app.component('fundsShowComponent', require('./components/FundsShowComponent'));
app.component('transactionsComponent', require('./components/TransactionsComponent'));
app.component('officesComponent', require('./components/OfficesComponent'));
app.component('officesEditComponent', require('./components/OfficesEditComponent'));
app.component('productsComponent', require('./components/ProductsComponent'));
app.component('productsEditComponent', require('./components/ProductsEditComponent'));
app.component('productsShowComponent', require('./components/ProductsShowComponent'));
app.component('organizationProvidersComponent', require('./components/OrganizationProvidersComponent'));
app.component('organizationValidatorsComponent', require('./components/OrganizationValidatorsComponent'));
app.component('organizationValidatorsEditComponent', require('./components/OrganizationValidatorsEditComponent'));
app.component('csvValidationComonent', require('./components/CsvValidationComonent'));
app.component('validationRequestsComonent', require('./components/ValidationRequestsComonent'));
app.component('validationRequestComonent', require('./components/ValidationRequestComonent'));

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

// Directives
switch (env_data.panel_type) {
    case 'sponsor': {
        app.directive('menu', require('./directives/MenuSponsorDirective'));
    }; break;
    case 'provider': {
        app.directive('menu', require('./directives/MenuProviderDirective'));
    }; break;
    case 'validator': {
        app.directive('menu', require('./directives/MenuValidatorDirective'));
    }; break;
}

app.directive('fundCardSponsor', require('./directives/FundCardSponsorDirective'));
app.directive('fundCardProvider', require('./directives/FundCardProviderDirective'));
app.directive('fundCardAvailableProvider', require('./directives/FundCardAvailableProviderDirective'));
app.directive('productCard', require('./directives/ProductCardDirective'));
app.directive('multiSelect', require('./directives/MultiSelectDirective'));
app.directive('scheduleControl', require('./directives/ScheduleControlDirective.js'));
app.directive('emptyBlock', require('./directives/EmptyBlockDirective'));
app.directive('modalFundsAdd', require('./directives/ModalFundsAddDirective'));
app.directive('csvUpload', require('./directives/CsvUploadDirective'));
app.directive('progressBar', require('./directives/ProgressBarDirective'));
app.directive('prevalidatedTable', require('./directives/PrevalidatedTableDirective'));
app.directive('photoSelector', require('./directives/PhotoSelectorDirective'));

// Providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));

// Filters
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('to_fixed', require('./filters/ToFixedFilter'));

// Config
app.config(require('./routers/router'));
app.config(require('./config/api-service'));

app.run(require('./routers/router-transitions'));

// Bootstrap the app
angular.bootstrap(document.querySelector('body'), ['forusApp', '720kb.datepicker']);

if (!env_data.html5ModeEnabled) {
    if (!document.location.hash) {
        document.location.hash = '#!/';
    }
}

module.exports = app;