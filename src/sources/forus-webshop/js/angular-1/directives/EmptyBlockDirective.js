let EmptyBlockDirective = function($state, $scope) {
    $scope.hideLink = !!$scope.hideLink;
    $scope.openActivateCodePopup = () => $state.go('start');
};

module.exports = () => {
    return {
        scope: {
            title: '@',
            description: '@',
            text: '@',
            hideLink: '=?'
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$state',
            '$scope',
            EmptyBlockDirective
        ],
        templateUrl: 'assets/tpl/directives/empty-block.html' 
    };
};