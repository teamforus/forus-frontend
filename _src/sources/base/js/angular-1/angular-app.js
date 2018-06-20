var helloWorldApp = angular.module('helloWorldApp', []);
// Controllers
helloWorldApp.controller('BaseController', require('./controllers/BaseController'));

// Providers
helloWorldApp.provider('ApiRequest', require('./providers/ApiRequestProvider'));

// Directives
// helloWorldApp.directive('formDirective', require('./directives/FormDirective.js'));

// Services
helloWorldApp.service('MessageService', require('./services/MessageService'));

// Filters
// none

// Components
helloWorldApp.component('messageItem', require('./components/MessageItemComponent'));
helloWorldApp.component('messageList', require('./components/MessageListComponent'));
helloWorldApp.component('messageForm', require('./components/MessageFormComponent'));

helloWorldApp.config(['ApiRequestProvider', function(ApiRequestProvider) {
    ApiRequestProvider.setHost(qdt_c.platform.env_data.api_url);
}]);

angular.bootstrap(document.getElementById('helloWorldApp'), ['helloWorldApp']);