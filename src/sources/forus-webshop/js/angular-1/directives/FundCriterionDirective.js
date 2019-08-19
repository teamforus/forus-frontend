let FundCriterionDirective = function(
    $scope,
    FundService
) {
    $scope.validators = $scope.fund.validators.map(function(validator) {
        return validator.identity_address;
    });

    $scope.records = FundService.checkEligibility(
        $scope.records || [],
        $scope.criterion,
        $scope.validators,
        $scope.fund.organization_id
    );

    if ($scope.records.filter(
            record => record.state == 'valid').length > 0) {
        $scope.criterion.state = 'valid';
    }

    $scope.updated($scope.criterion.state == 'valid');
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            criterion: '=',
            recordType: '=',
            records: '=',
            updated: '='
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            'FundService',
            FundCriterionDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-criterion.html'
    };
};