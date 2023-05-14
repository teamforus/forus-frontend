const FundRequestRecordDetailsDirective = function(
    $scope,
) {
    const { $dir } = $scope;

    $dir.shownType = 'history';

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
            FundRequestRecordDetailsDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-request-record-details.html'
    };
};