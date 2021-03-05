let BlockProductSubsidyFormDirective = function() {};

module.exports = () => {
    return {
        scope: {
            form: '=',
            stockAmount: '=',
            unlimitedStock: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            BlockProductSubsidyFormDirective
        ],
        templateUrl: 'assets/tpl/directives/blocks/sponsor/block-product-subsidy-form.html'
    };
};