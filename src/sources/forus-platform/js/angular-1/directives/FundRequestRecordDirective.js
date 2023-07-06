const FundRequestRecordDirective = function($scope) {
    const { $dir } = $scope;

    $dir.$onInit = () => {
        $dir.hasMultiple = [
            $dir.fundRequestRecord.files.length > 0,
            $dir.fundRequestRecord.history.length > 0,
            $dir.fundRequestRecord.clarifications.length > 0,
        ].filter((value) => value).length > 1;

        if ($dir.fundRequestRecord.files.length > 0) {
            return $dir.shownType = 'files';
        }

        if ($dir.fundRequestRecord.clarifications.length > 0) {
            return $dir.shownType = 'clarifications';
        }

        if ($dir.fundRequestRecord.history.length > 0) {
            return $dir.shownType = 'history';
        }
    };
};

module.exports = () => {
    return {
        scope: {
            fundRequest: '=',
            organization: '=',
            fundRequestRecord: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "E",
        replace: true,
        controller: [
            '$scope',
            FundRequestRecordDirective,
        ],
        templateUrl: 'assets/tpl/directives/fund-request-record.html',
    };
};