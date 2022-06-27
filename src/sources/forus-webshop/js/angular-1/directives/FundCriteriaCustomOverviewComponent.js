const FundCriteriaCustomOverviewComponent = function() {};

module.exports = () => {
    return {
        scope: {},
        bindToController: {
            key: '=',
        },
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: FundCriteriaCustomOverviewComponent,
        templateUrl: 'assets/tpl/directives/fund-criteria-custom-overview.html'
    };
};