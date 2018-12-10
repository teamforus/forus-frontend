let ContactFormDirective = function(
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
            ContactFormDirective
        ],
        templateUrl: 'assets/tpl/directives/contact-form.html'
    };
};