let SelectControlOptions = function($scope, $timeout) {
    let $dir = {};
    let optionsPreloadSize;

    $scope.$dir = $dir;

    $dir.options = [];
    $dir.displayCount = 0;

    $dir.onScrolledOption = () => {
        $dir.displayCount += optionsPreloadSize;

        $timeout(() => {
            $dir.options = $scope.options.slice(0, $dir.displayCount);
        }, 0);
    };

    $dir.select = (option) => {
        $scope.change({
            option: option
        });
    };

    $scope.$watch('options', () => {
        $dir.displayCount = 0;
        $dir.onScrolledOption();
    });

    $scope.init = () => {
        optionsPreloadSize = parseInt($scope.optionsPreloadSize || 50);
        $dir.onScrolledOption();
    }

    $scope.init();
};

module.exports = () => {
    return {
        scope: {
            change: "&",
            options: "=",
            optionsPreloadSize: "@",
            hideOptions: "&",
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$timeout',
            SelectControlOptions
        ],
        template: ($el, $attr) => {
            const templateName = $attr.template || 'select-control-options';

            return $el ? {
                'select-control-options': require('./templates/select-control-options.pug')(),
                'select-control-options-fund': require('./templates/select-control-options-fund.pug')(),
                'select-control-options-organization': require('./templates/select-control-options-organization.pug')(),
            }[templateName] || `<div>Template: ${templateName} not found</div>` : '<div></div>';
        }
    };
};