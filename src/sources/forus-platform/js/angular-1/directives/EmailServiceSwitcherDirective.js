let EmailServiceSwitcherDirective = function(
    $scope,
    $element,
    HelperService
) {
    $scope.alignDir = angular.isDefined($scope.align) ? $scope.align : 'center';
    $scope.asText   = angular.isDefined($scope.asText);

    $scope.emailServiceUrl = HelperService.getEmailService($scope.email);

    $scope.onSwitchHandler = () => {
        if (!$scope.emailServiceUrl) {
            return;
        }

        if ($scope.onChange) {
            $scope.onChange();
            return;
        }

        HelperService.openInNewTab($scope.emailServiceUrl);
    }
};

module.exports = () => {
    return {
        scope: {
            email: '<',
            align: '@?',
            asText: '@?',
            onChange: '<?',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            'HelperService',
            EmailServiceSwitcherDirective
        ],
        templateUrl: 'assets/tpl/directives/email-service-switcher.html'
    };
};