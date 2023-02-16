const BlockEmptyDirective = function($scope) {
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
            BlockEmptyDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-empty.html',
    };
};