let WebshopsDirective = function(
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
            WebshopsDirective
        ],
        templateUrl: 'assets/tpl/directives/webshops.html'
    };
};