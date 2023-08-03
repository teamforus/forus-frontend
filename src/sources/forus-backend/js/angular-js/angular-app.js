require('../../../forus-platform/js/angular-1/modules/select-control/SelectControlModule');

const app = angular.module('app', [
    'forus.selectControl',
]);

// constants
app.constant('appConfigs', env_data);

// controllers
app.controller('BaseController', require('./controllers/BaseController'));

// services
app.service('AuthService', require('./services/AuthService'));
app.service('IdentityService', require('./services/IdentityService'));
app.service('CredentialsService', require('./services/CredentialsService'));
app.service('ModalService', require('../../../forus-platform/js/angular-1/services/ModalService'));
app.service('Identity2FAService', require('../../../forus-platform/js/angular-1/services/Identity2FAService'));
app.service('PushNotificationsService', require('../../../forus-platform/js/angular-1/services/PushNotificationsService'));

// components
app.component('auth2FAComponent', require('./components/Auth2FAComponent'));

app.component('modal2FASetupComponent', {
    ...require('../../../forus-platform/js/angular-1/components/Modals/Modal2FASetupComponent'),
    template: require('../../../forus-platform/pug/tpl/modals/modal-2fa-setup.pug')(),
    templateUrl: null,
});

app.component('modal2FADeactivateComponent', {
    ...require('../../../forus-platform/js/angular-1/components/Modals/Modal2FADeactivateComponent'),
    template: require('../../../forus-platform/pug/tpl/modals/modal-2fa-deactivate.pug')(),
    templateUrl: null,
});

// directives
app.directive('pincodeControl', require('../../../forus-platform/js/angular-1/directives/PincodeControlDirective'));
app.directive('qrCode', require('../../../forus-platform/js/angular-1/directives/QrCodeDirective'));

// Modals
app.directive('modalsRoot', require('../../../forus-platform/js/angular-1/directives/modals/ModalsRootDirective'));
app.directive('modalItem', require('../../../forus-platform/js/angular-1/directives/modals/ModalItemDirective'));
app.directive('modalScrollBreaker', require('../../../forus-platform/js/angular-1/directives/modals/ModalScrollBreakerDirective'));

// providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));
app.provider('ModalRoute', require('../../../forus-platform/js/angular-1/providers/ModalRouteProvider'));

// configs
app.config(require('./config/api-service'));
app.config(require('./routes/modals'));

app.config(['$compileProvider', function($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|meapp):/);
}]);

// bootstrap
angular.bootstrap(document.querySelector('html'), [
    'app'
]);