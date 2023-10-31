const FundRequestCardDirective = function ($scope) {
    const { $dir } = $scope;

    $dir.$onInit = () => {
        $dir.fundRequest.notAnsweredCount = $dir.fundRequest.records.map((record) => {
            return record.clarifications.filter((item) => item.state !== "answered").length;
        }).reduce((a, b) => a + b, 0);
    };
};

module.exports = () => {
    return {
        scope: {
            fundRequest: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FundRequestCardDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-request-card.html',
    };
};