const BlockFeatureDirective = function($scope, ModalService) {
    const { $dir } = $scope;

    $dir.openContactModal = () => {
        ModalService.open('featureContact');
    };
};

module.exports = () => {
    return {
        scope: {
            feature: '<',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'ModalService',
            BlockFeatureDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-feature.html',
    };
};