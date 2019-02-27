let ImplementationDirective = function(
    $scope,
    ConfigService
) {
    $scope.cfg = {
        logoExtension: ConfigService.getFlag('logoExtension')
    };
};

module.exports = () => {
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ConfigService',
            ImplementationDirective
        ],
        templateUrl: 'assets/tpl/directives/implementation.html'
    };
};