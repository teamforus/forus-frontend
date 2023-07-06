const FundRequestRecordHistoryDirective = function(
    $scope,
) {
    const { $dir } = $scope;

    $dir.$onInit = () => {};
};

module.exports = () => {
    return {
        scope: {
            fundRequest: '=',
            fundRequestRecord: '=',
            organization: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FundRequestRecordHistoryDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-request-record-history.html'
    };
};