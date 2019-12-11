let _module = angular.module('forus.pageLoadingBarModule', []);

_module.directive('pageLoadingBar', require('./directives/PageLoadingBarDirective'));
_module.service('PageLoadingBarService', require('./services/PageLoadingBarService'));
