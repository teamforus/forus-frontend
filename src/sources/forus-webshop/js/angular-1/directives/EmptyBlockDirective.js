let EmptyBlockDirective = function($scope, ModalService) {
    $scope.hideLink = !!$scope.hideLink;
    $scope.openActivateCodePopup = function () {
        ModalService.open('modalActivateCode', {});
    };
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
            '$scope',
            'ModalService',
            EmptyBlockDirective
        ],
        templateUrl: 'assets/tpl/directives/empty-block.html' 
    };
};