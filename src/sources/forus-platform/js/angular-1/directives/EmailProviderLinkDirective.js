const EmailProviderLinkDirective = function($scope, HelperService) {
    const $dir = $scope.$dir;

    const onEmailChange = (value) => {
        $dir.url = value ? HelperService.getEmailServiceProviderUrl(value) : null;
    };

    $dir.$onInit = () => {
        $dir.icon = !$dir.icon ? 'open-in-new' : $dir.icon;
        $dir.type = !$dir.type ? 'button' : $dir.type;

        $scope.$watch('$dir.email', onEmailChange);
    };
};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            icon: '@',
            type: '@',
            email: '<',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'HelperService',
            EmailProviderLinkDirective
        ],
        link: function(scope, element, attrs) {
            element[0].target = (scope && attrs.target) ? attrs.target : '_blank';
        },
        templateUrl: 'assets/tpl/directives/email-provider-link.html'
    };
};