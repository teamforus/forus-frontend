require('./modules/select-control/SelectControlModule');
require('./modules/page-loading-bar/PageLoadingBarModule');

let app = angular.module('forusApp', [
    'ui.router', 'pascalprecht.translate', 'ngCookies', 'uiCropper', 
    'ngLocale', '720kb.datepicker', 'forus.selectControl', 'ngSanitize', 
    'forus.pageLoadingBarModule',
]);

app.constant('appConfigs', env_data);

// Controllers
app.controller('BaseController', require('./controllers/BaseController'));

// Components
app.component('homeComponent', require('./components/HomeComponent'));
app.component('organizationsComponent', require('./components/OrganizationsComponent'));
app.component('organizationsEditComponent', require('./components/OrganizationsEditComponent'));
app.component('organizationFundsComponent', require('./components/OrganizationFundsComponent'));
app.component('providerFundsComponent', require('./components/ProviderFundsComponent'));
app.component('fundsEditComponent', require('./components/FundsEditComponent'));
app.component('fundsShowComponent', require('./components/FundsShowComponent'));
app.component('transactionsComponent', require('./components/TransactionsComponent'));
app.component('vouchersComponent', require('./components/VouchersComponent'));
app.component('productVouchersComponent', require('./components/ProductVouchersComponent'));
app.component('officesComponent', require('./components/OfficesComponent'));
app.component('officesEditComponent', require('./components/OfficesEditComponent'));
app.component('productsComponent', require('./components/ProductsComponent'));
app.component('productsEditComponent', require('./components/ProductsEditComponent'));
app.component('productsShowComponent', require('./components/ProductsShowComponent'));
app.component('organizationProvidersComponent', require('./components/OrganizationProvidersComponent'));
app.component('organizationEmployeesComponent', require('./components/OrganizationEmployeesComponent'));
app.component('csvValidationComponent', require('./components/CsvValidationComponent'));
app.component('fundRequestsComponent', require('./components/FundRequestsComponent'));
app.component('validationRequestComponent', require('./components/ValidationRequestComponent'));
app.component('signUpComponent', require('./components/SignUpComponent'));
app.component('financialDashboardComponent', require('./components/FinancialDashboardComponent'));
app.component('transactionComponent', require('./components/TransactionComponent'));
app.component('fundProviderComponent', require('./components/FundProviderComponent'));
app.component('noPermissionComponent', require('./components/NoPermissionComponent'));
app.component('emailPreferencesComponent', require('./components/EmailPreferencesComponent'));
app.component('fundProviderInviteComponent', require('./components/FundProviderInviteComponent'));

// Modal Components
app.component('modalAuthComponent', require('./components/Modals/ModalAuthComponent'));
app.component('modalPinCodeComponent', require('./components/Modals/ModalPinCodeComponent'));
app.component('modalFundTopUpComponent', require('./components/Modals/ModalFundTopUpComponent'));
app.component('modalEmployeeEditComponent', require('./components/Modals/ModalEmployeeEditComponent'));
app.component('modalNotificationComponent', require('./components/Modals/ModalNotificationComponent'));
app.component('modalPhotoUploaderComponent', require('./components/Modals/ModalPhotoUploaderComponent'));
app.component('modalVoucherCreateComponent', require('./components/Modals/ModalVoucherCreateComponent'));
app.component('modalProductVoucherCreateComponent', require('./components/Modals/ModalProductVoucherCreateComponent'));
app.component('modalVoucherQrCodeComponent', require('./components/Modals/ModalVoucherQrCodeComponent'));
app.component('modalVouchersUploadComponent', require('./components/Modals/ModalVouchersUploadComponent'));
app.component('modalMarkdownCustomLinkComponent', require('./components/Modals/ModalMarkdownCustomLinkComponent'));
app.component('modalPdfPreviewComponent', require('./components/Modals/ModalPdfPreviewComponent'));
app.component('modalFundRequestRecordClarifyComponent', require('./components/Modals/FundRequests/ModalFundRequestRecordClarifyComponent'));
app.component('modalFundRequestRecordDeclineComponent', require('./components/Modals/FundRequests/ModalFundRequestRecordDeclineComponent'));
app.component('modalFundCriteriaDescriptionEditComponent', require('./components/Modals/ModalFundCriteriaDescriptionEditComponent'));
app.component('modalFundInviteProvidersComponent', require('./components/Modals/ModalFundInviteProvidersComponent'));
app.component('modalFundOffersComponent', require('./components/Modals/ModalFundOffersComponent'));
app.component('modalBusinessSelectComponent', require('./components/Modals/ModalBusinessSelectComponent'));

// Modal Components
app.component('printableVoucherQrCodeComponent', require('./components/Printables/PrintableVoucherQrCodeComponent'));

// Services
app.service('AuthService', require('./services/AuthService'));
app.service('DateService', require('./services/DateService'));
app.service('OrganizationService', require('./services/OrganizationService'));
app.service('TransactionService', require('./services/TransactionService'));
app.service('VoucherService', require('./services/VoucherService'));
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
app.service('BusinessTypeService', require('./services/BusinessTypeService'));
app.service('OfficeService', require('./services/OfficeService'));
app.service('ProductService', require('./services/ProductService'));
app.service('ProviderFundService', require('./services/ProviderFundService'));
app.service('OrganizationEmployeesService', require('./services/OrganizationEmployeesService'));
app.service('PrevalidationService', require('./services/PrevalidationService'));
app.service('ProgressFakerService', require('./services/ProgressFakerService'));
app.service('ValidatorRequestService', require('./services/ValidatorRequestService'));
app.service('MediaService', require('./services/MediaService'));
app.service('ProviderIdentityService', require('./services/ProviderIdentityService'));
app.service('ConfigService', require('./services/ConfigService'));
app.service('ImageConvertorService', require('./services/ImageConvertorService'));
app.service('ModalService', require('./services/ModalService'));
app.service('PrintableService', require('./services/PrintableService'));
app.service('PermissionsService', require('./services/PermissionsService'));
app.service('RoleService', require('./services/RoleService'));
app.service('SmsService', require('./services/SmsService'));
app.service('FileService', require('./services/FileService'));
app.service('FundRequestValidatorService', require('./services/FundRequestValidatorService'));
app.service('FundProviderInvitationsService', require('./services/FundProviderInvitationsService'));
app.service('EmailPreferencesService', require('./services/EmailPreferencesService'));
app.service('PushNotificationsService', require('./services/PushNotificationsService'));
app.service('DigIdService', require('./services/DigIdService'));

// Directives
switch (env_data.panel_type) {
    case 'sponsor':
        {
            app.directive('menu', require('./directives/MenuSponsorDirective'));
        };
        break;
    case 'provider':
        {
            app.directive('menu', require('./directives/MenuProviderDirective'));
        };
        break;
    case 'validator':
        {
            app.directive('menu', require('./directives/MenuValidatorDirective'));
        };
        break;
}

app.directive('fundCardSponsor', require('./directives/FundCardSponsorDirective'));
app.directive('fundCardProvider', require('./directives/FundCardProviderDirective'));
app.directive('fundCardProviderFinances', require('./directives/FundCardProviderFinancesDirective'));
app.directive('fundCardAvailableProvider', require('./directives/FundCardAvailableProviderDirective'));
app.directive('fundCardProviderCanJoin', require('./directives/FundCardProviderCanJoinDirective'));
app.directive('productCard', require('./directives/ProductCardDirective'));
app.directive('multiSelect', require('./directives/MultiSelectDirective'));
app.directive('scheduleControl', require('./directives/ScheduleControlDirective.js'));
app.directive('csvUpload', require('./directives/CsvUploadDirective'));
app.directive('progressBar', require('./directives/ProgressBarDirective'));
app.directive('prevalidatedTable', require('./directives/PrevalidatedTableDirective'));
app.directive('photoSelector', require('./directives/PhotoSelectorDirective'));
app.directive('radialChart', require('./directives/RadialChartDirective'));
app.directive('barChart', require('./directives/BarChartDirective'));
app.directive('collapse', require('./directives/CollpaseDirective'));
app.directive('landingNavbar', require('./directives/landing/NavbarDirective'));
app.directive('landingContactForm', require('./directives/landing/ContactFormDirective'));
app.directive('landingAppFooter', require('./directives/landing/LandingAppFooterDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));
app.directive('numberControl', require('./directives/NumberControlDirective'));
app.directive('productCategoriesControl', require('./directives/ProductCategoriesControlDirective'));
app.directive('officeEditInline', require('./directives/OfficeEditInlineDirective'));
app.directive('tooltip', require('./directives/TooltipDirective'));
app.directive('informationBlock', require('./directives/InformationBlockDirective'));
app.directive('menuScrollToggle', require('./directives/landing/MenuScrollToggleDirective'));
app.directive('phoneControl', require('./directives/PhoneControlDirective'));
app.directive('i18n', require('./directives/I18nDirective'));
app.directive('preventPropagation', require('./directives/PreventPropagation'));
app.directive('markdown', require('./directives/MarkdownDirective'));
app.directive('inputCheckboxControl', require('./directives/InputCheckboxControlDirective'));
app.directive('formLabelToggle', require('./directives/FormLabelToggleDirective'));
app.directive('clickOutside', require('./directives/ClickOutsideDirective'));
app.directive('scrollEnd', require('./directives/ScrollEndDirective'));
app.directive('qrCode', require('./directives/QrCodeDirective'));
app.directive('pdfPreview', require('./directives/PdfPreviewDirective'));
app.directive('pushNotifications', require('./directives/PushNotificationsDirective'));
app.directive('fundCardInvitationProvider', require('./directives/FundCardInvitationProviderDirective'));

app.directive('paginator', require('./directives/paginators/PaginatorDirective'));
app.directive('paginatorLoader', require('./directives/paginators/PaginatorLoaderDirective'));

// Modals
app.directive('modalsRoot', require('./directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('./directives/modals/ModalItemDirective'));
app.directive('modalScrollBraker', require('./directives/modals/ModalScrollBrakerDirective'));

// Printable
app.directive('printablesRoot', require('./directives/printables/PrintableRootDirective'));
app.directive('printableItem', require('./directives/printables/PrintableItemDirective'));
app.directive('printableEnabler', require('./directives/printables/PrintableEnablerDirective'));

app.directive('blockEmpty', require('./directives/blocks/BlockEmptyDirective'));
app.directive('blockNoPermission', require('./directives/blocks/BlockNoPermissionDirective'));

// Providers
app.provider('PrintableRoute', require('./providers/PrintableRouteProvider'));
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('ModalRoute', require('./providers/ModalRouteProvider'));
app.provider('I18nLib', require('./providers/I18nLibProvider'));

// Filters
app.filter('currency_format', require('./filters/CurrencyFormatFilter'));
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('to_fixed', require('./filters/ToFixedFilter'));
app.filter('file_size', require('./filters/FileSizeFilter'));
app.filter('hasPerm', require('./filters/HasPerm'));
app.filter('i18n', require('./filters/I18nFilter'));
app.filter('str_limit', require('./filters/StrLimitFilter'));

// Config
app.config(require('./routers/printables'));
app.config(require('./routers/modals'));
app.config(require('./routers/router'));
app.config(require('./config/api-service'));
app.config(require('./config/i18n'));
app.config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
}])

app.run(require('./routers/router-transitions'));

app.run(['appConfigs', (appConfigs) => {
    appConfigs.flags = Object.assign(
        require('./config/flags.js'),
        env_data.flags || {}
    );
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
