let ProductsComponent = function(
    $scope,
    $state,
    appConfigs,
) {
    let $ctrl = this;

    $scope.appConfigs = appConfigs;

    $scope.$watch('appConfigs', (_appConfigs) => {
        if (_appConfigs.features && !_appConfigs.features.products.list) {
            $state.go('home');
        }
    }, true);

    $ctrl.$onInit = function() {};
};

module.exports = {
    bindings: {},
    controller: [
        '$scope',
        '$state',
        'appConfigs',
        ProductsComponent
    ],
    templateUrl: 'assets/tpl/pages/products.html'
};