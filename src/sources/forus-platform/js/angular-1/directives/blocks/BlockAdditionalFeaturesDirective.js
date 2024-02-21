const BlockAdditionalFeaturesDirective = function() {};

module.exports = () => {
    return {
        scope: {
            features: '<',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            BlockAdditionalFeaturesDirective,
        ],
        templateUrl: 'assets/tpl/directives/blocks/block-additional-features.html',
    };
};