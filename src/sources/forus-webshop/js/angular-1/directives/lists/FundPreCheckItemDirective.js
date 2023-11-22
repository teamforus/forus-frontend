const FundPreCheckItemDirective = function(
    $scope,
) {
    const $dir = $scope.$dir = {};

    $dir.fund = $scope.fund;

    $dir.showMoreRequestInfo = false;
    
    $dir.setShowMore = (e, showMore = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMore = showMore;
    };
    
    $dir.setShowMoreRequestInfo = (e, showMoreRequestInfo = false) => {
        e?.preventDefault();
        e?.stopPropagation();
        
        $dir.showMoreRequestInfo = showMoreRequestInfo;
    };
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            funds: '=',
            vouchers: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FundPreCheckItemDirective,
        ],
        templateUrl: ($el, $attr) => {
            return 'assets/tpl/directives/lists/funds/fund-item-pre-check.html'
        }
    };
};
