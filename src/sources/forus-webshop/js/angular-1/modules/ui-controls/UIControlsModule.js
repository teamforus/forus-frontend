let _module = angular.module('forus.uiControls', ['720kb.datepicker']);

// UI Controls
_module.directive('uiControlStep', require('./directives/UIControlStepDirective'));
_module.directive('uiControlText', require('./directives/UIControlTextDirective'));
_module.directive('uiControlTextarea', require('./directives/UIControlTextAreaDirective'));
_module.directive('uiControlEmail', require('./directives/UIControlEmailDirective'));
_module.directive('uiControlDate', require('./directives/UIControlDateDirective'));
_module.directive('uiControlNumber', require('./directives/UIControlNumberDirective'));
_module.directive('uiControlCurrency', require('./directives/UIControlCurrencyDirective'));
_module.directive('uiControlCheckbox', require('./directives/UIControlCheckboxDirective'));
_module.directive('uiControlSearchInput', require('./directives/UIControlSearchInputDirective'));
