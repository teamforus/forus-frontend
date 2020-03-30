let app = angular.module('app', []);

// constants
app.constant('appConfigs', env_data);

// controllers
app.controller('BaseController', require('./controllers/BaseController'));

// services
app.service('AuthService', require('./services/AuthService'));
app.service('IdentityService', require('./services/IdentityService'));
app.service('CredentialsService', require('./services/CredentialsService'));

// components
app.component('authPinCode', require('./components/AuthPinCodeComponent'));

// directives
app.directive('pinCodeControl', require('./directives/PinCodeControlDirective'));

// providers
app.provider('ApiRequest', require('./providers/ApiRequestProvider'));

// configs
app.config(require('./config/api-service'));

// bootstrap
angular.bootstrap(document.querySelector('html'), [
    'app'
]);