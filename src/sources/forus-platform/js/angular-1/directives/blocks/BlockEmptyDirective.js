const BlockEmptyDirective = function($scope, $state) {
    const { $dir } = $scope;

    $dir.buttonHandler = ($event) => {
        $event?.preventDefault();
        $event?.stopPropagation();

        if ($dir.buttonSref) {
            return $state.go($dir.buttonSref, $dir.buttonSrefParams || {});
        }

        $dir.buttonCallback();
    };
};

module.exports = () => {
    return {
        scope: {
            title: '@',
            text: '@',
            button: '=',
            align: '@',
            imageSrc: '@',
            buttonSref: '@',
            buttonSrefParams: '=',
            buttonCallback: '&',
            buttonText: '@',
            buttonType: '@',
            buttonIcon: '@',
            buttonIconEnd: '@',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$state',
            BlockEmptyDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-empty.html',
    };
};