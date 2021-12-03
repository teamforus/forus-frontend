require('./modules/select-control/SelectControlModule');
require('./modules/ui-controls/UIControlsModule');
require('./modules/page-loading-bar/PageLoadingBarModule');

const appConfigs = {
    ...{ fund_request_allways_bsn_confirmation: true },
    ...env_data
};

const app = angular.module('forusApp', [
    'pascalprecht.translate', 'ui.router', 'ngCookies', 'ngAria',
    'forus.selectControl', 'forus.uiControls', 'forus.pageLoadingBarModule',
]);

app.constant('appConfigs', appConfigs);

// Controllers
app.controller('BaseController', require('./controllers/BaseController'));

// Components
app.component('homeComponent', require('./components/HomeComponent'));
app.component('signUpComponent', require('./components/SignUpComponent')); // todo: cleanup
app.component('signUpProviderComponent', require('./components/SignUpProviderComponent'));
app.component('fundsComponent', require('./components/FundsComponent'));
app.component('vouchersComponent', require('./components/VouchersComponent'));
app.component('reservationsComponent', require('./components/ReservationsComponent'));
app.component('recordsComponent', require('./components/RecordsComponent'));
app.component('productsComponent', require('./components/ProductsComponent'));
app.component('productComponent', require('./components/ProductComponent'));
app.component('providersComponent', require('./components/ProvidersComponent'));
app.component('providerOfficeComponent', require('./components/ProviderOfficeComponent'));
app.component('providerComponent', require('./components/ProviderComponent'));
app.component('voucherComponent', require('./components/VoucherComponent'));
app.component('fundComponent', require('./components/FundComponent'));
app.component('fundRequestComponent', require('./components/FundRequestComponent'));
app.component('fundActivateComponent', require('./components/FundActivateComponent'));
app.component('fundRequestClarificationComponent', require('./components/FundRequestClarificationComponent'));
app.component('recordValidateComponent', require('./components/RecordValidateComponent'));
app.component('recordValidationsComponent', require('./components/RecordValidationsComponent'));
app.component('recordCreateComponent', require('./components/RecordCreateComponent'));
app.component('meComponent', require('./components/MeComponent'));
app.component('emailPreferencesComponent', require('./components/EmailPreferencesComponent'));
app.component('accessibilityComponent', require('./components/AccessibilityComponent'));
app.component('privacyComponent', require('./components/PrivacyComponent'));
app.component('termsAndConditionsComponent', require('./components/TermsAndConditionsComponent'));
app.component('errorComponent', require('./components/ErrorComponent'));
app.component('securitySessionsComponent', require('./components/SecuritySessionsComponent'));
app.component('identityEmailsComponent', require('./components/IdentityEmailsComponent'));
app.component('notificationsComponent', require('./components/NotificationsComponent'));
app.component('explanationComponent', require('./components/ExplanationComponent'));
app.component('errorPageComponent', require('./components/ErrorPageComponent'));
app.component('searchResultComponent', require('./components/SearchResultComponent'));
app.component('sitemapComponent', require('./components/SitemapComponent'));

// Services
app.service('ArrService', require('./services/ArrService'));
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
app.service('ProductCategoryService', require('./services/ProductCategoryService'));
app.service('OfficeService', require('./services/OfficeService'));
app.service('ProductService', require('./services/ProductService'));
app.service('ProductReservationService', require('./services/ProductReservationService'));
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
app.service('ShareService', require('./services/ShareService'));
app.service('PrintableService', require('./services/PrintableService'));
app.service('BusinessTypeService', require('./services/BusinessTypeService'));
app.service('EmailPreferencesService', require('./services/EmailPreferencesService'));
app.service('FileService', require('./services/FileService'));
app.service('DigIdService', require('./services/DigIdService'));
app.service('PushNotificationsService', require('./services/PushNotificationsService'));
app.service('LocalStorageService', require('./services/LocalStorageService'));
app.service('ProvidersService', require('./services/ProvidersService'));
app.service('SessionService', require('./services/SessionService'));
app.service('IdentityEmailsService', require('./services/IdentityEmailsService'));
app.service('NotificationsService', require('./services/NotificationsService'));
app.service('PhysicalCardsService', require('./services/PhysicalCardsService'));
app.service('PhysicalCardsRequestService', require('./services/PhysicalCardsRequestService'));
app.service('HelperService', require('./services/HelperService'));
app.service('SearchService', require('./services/SearchService'));

// Directives
app.directive('emptyBlock', require('./directives/EmptyBlockDirective'));
app.directive('topNavbar', require('./directives/TopNavbarDirective')); // todo: cleanup
app.directive('topNavbarSearch', require('./directives/TopNavbarSearchDirective'));
app.directive('mobileFooter', require('./directives/MobileFooterDirective'));
app.directive('skipLinks', require('./directives/SkipLinksDirective'));
app.directive('webshops', require('./directives/WebshopsDirective'));
app.directive('implementation', require('./directives/ImplementationDirective'));
app.directive('fundCriterion', require('./directives/FundCriterionDirective'));
app.directive('profileMenu', require('./directives/ProfileMenuDirective'));
app.directive('blockProducts', require('./directives/BlockProductsDirective'));
app.directive('googleMap', require('./directives/GoogleMapDirective'));
app.directive('pincodeControl', require('./directives/PincodeControlDirective'));
app.directive('dashInputControl', require('./directives/DashInputControlDirective'));
app.directive('scrollTo', require('./directives/ScrollToDirective'));
app.directive('collapse', require('./directives/CollapseDirective'));
app.directive('voucherCard', require('./directives/VoucherCardDirective'));
app.directive('reservationCard', require('./directives/ReservationCardDirective'));
app.directive('productCard', require('./directives/ProductCardDirective'));
app.directive('appFooter', require('./directives/AppFooterDirective'));
app.directive('i18n', require('./directives/I18nDirective'));
app.directive('forusSupport', require('./directives/ForusSupportDirective'));
app.directive('preventPropagation', require('./directives/PreventPropagation'));
app.directive('phoneControl', require('./directives/PhoneControlDirective'));
app.directive('tooltip', require('./directives/TooltipDirective'));
app.directive('forusChat', require('./directives/ForusChatDirective'));
app.directive('clickOutside', require('./directives/ClickOutsideDirective'));
app.directive('scrollEnd', require('./directives/ScrollEndDirective'));
app.directive('qrCode', require('./directives/QrCodeDirective'));
app.directive('fileUploader', require('./directives/controls/FileUploaderDirective'));
app.directive('pushNotifications', require('./directives/PushNotificationsDirective'));
app.directive('productsList', require('./directives/ProductsListDirective'));
app.directive('searchItemsList', require('./directives/SearchItemsListDirective'));
app.directive('inputRadioControl', require('./directives/InputRadioControlDirective'));
app.directive('inputCheckboxControl', require('./directives/InputCheckboxControlDirective'));
app.directive('emailProviderLink', require('./directives/EmailProviderLinkDirective'));

app.directive('pdfPreview', require('./directives/file_preview/PdfPreviewDirective'));

app.directive('paginator', require('./directives/paginators/PaginatorDirective'));
app.directive('paginatorLoader', require('./directives/paginators/PaginatorLoaderDirective'));

app.directive('appLinks', require('./directives/elements/AppLinksDirective'));

app.directive('modalsRoot', require('./directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('./directives/modals/ModalItemDirective'));
app.directive('modalScrollBraker', require('./directives/modals/ModalScrollBrakerDirective'));

// Map pointers
app.directive('mapPointerProvidersOffice', require('./directives/map-pointers/MapPointerProvidersOfficeDirective'));
app.directive('mapPointerProvidersOfficeView', require('./directives/map-pointers/MapPointerProvidersOfficeViewDirective'));

app.directive('fundListItem', require('./directives/lists/FundItemDirective'));
app.directive('productListItem', require('./directives/lists/ProductItemDirective'));
app.directive('providerListItem', require('./directives/lists/ProviderItemDirective'));

// Modal Components
app.component('modalNotificationComponent', require('./components/Modals/ModalNotificationComponent'));
app.component('modalOfficesComponent', require('./components/Modals/ModalOfficesComponent'));
app.component('modalAuthComponent', require('./components/Modals/ModalAuthComponent')); // todo: cleanup
app.component('modalPinCodeComponent', require('./components/Modals/ModalPinCodeComponent'));
app.component('modalAuthCodeComponent', require('./components/Modals/ModalAuthCodeComponent'));
app.component('modalShareVoucherComponent', require('./components/Modals/ModalShareVoucherComponent'));
app.component('modalOpenInMeComponent', require('./components/Modals/ModalOpenInMeComponent'));
app.component('modalProductReserveComponent', require('./components/Modals/ModalProductReserveComponent'));
app.component('modalProductReserveDetailsComponent', require('./components/Modals/ModalProductReserveDetailsComponent'));
app.component('modalProductReserveCancelComponent', require('./components/Modals/ModalProductReserveCancelComponent'));
app.component('modalIdentityProxyExpiredComponent', require('./components/Modals/ModalIdentityProxyExpiredComponent'));
app.component('modalPhysicalCardTypeComponent', require('./components/Modals/ModalPhysicalCardTypeComponent'));
app.component('modalPhysicalCardUnlinkComponent', require('./components/Modals/ModalPhysicalCardUnlinkComponent'));
app.component('modalPdfPreviewComponent', require('./components/Modals/FilePreviews/ModalPdfPreviewComponent'));
app.component('modalImagePreviewComponent', require('./components/Modals/FilePreviews/ModalImagePreviewComponent'));
app.component('modalDeactivateVoucherComponent', require('./components/Modals/ModalDeactivateVoucherComponent'));

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
app.filter('percentage_format', require('./filters/PercentageFormatFilter'));
app.filter('pretty_json', require('./filters/PrettyJsonFilter'));
app.filter('json_pretty', require('./filters/PrettyJsonFilter'));
app.filter('to_fixed', require('./filters/ToFixedFilter'));
app.filter('i18n', require('./filters/I18nFilter'));
app.filter('duration', require('./filters/DurationFilter'));
app.filter('duration_last_time', require('./filters/DurationLastTimeFilter'));
app.filter('lines_to_array', require('./filters/LinesToArrayFilter'));
app.filter('capitalize', require('./filters/CapitalizeFilter'));
app.filter('str_limit', require('./filters/StrLimitFilter'));

// Config
app.config(require('./routers/printables'));
app.config(require('./routers/modals'));
app.config(require('./routers/router'));
app.config(require('./config/api-service'));
app.config(require('./config/i18n'));

app.run(require('./routers/router-transitions'));
app.run(require('./routers/modals-transitions'));

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